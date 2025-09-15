from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
import bcrypt
import ollama
import pymysql
import requests
from gtts import gTTS
import speech_recognition as sr
from sklearn.metrics.pairwise import cosine_similarity 
import numpy as np  # data processing 
import mysql.connector # FOR NOW WE'RE USING BOTH pymysql and mysql.connector
from datetime import datetime # Import datetime for formatting
import json
from datetime import date,timedelta


app = Flask(__name__)
app.secret_key = 'skowsaathisuperkey'
app.config.update(
    SESSION_COOKIE_SAMESITE="None",   # <--- must be string, not NoneType
    SESSION_COOKIE_SECURE=False       # False for localhost (set True only on HTTPS)
)
CORS(app, supports_credentials=True,origins=["http://localhost:5173"])

# --- Database Configuration ---
conn = pymysql.connect(
    host="localhost",
    user="root",
    password="Skow@",
    database="SAATHI",
    cursorclass=pymysql.cursors.DictCursor
)
cursor = conn.cursor()

# -------------------OLLAMA -------------------------------#
OLLAMA_MODEL = "L1Shell"
OLLAMA_URL = 'http://localhost:11434'
OLLAMA_GEN_URL = "http://localhost:11434/api/generate"

# -------------------------VARIABLES------------------------#
conversation_histories = {}
transaction_offsets = {}


#-------------------- DATABASE CONFIGURATION ---------------#
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Skow@',
    'database': 'SAATHI'
}
# ----------------------------------------------------------#

# ------------- TEXT RETURNING FUNCTION --------------------#
def speak(message):
    return jsonify({"reply": message})
# # ------------- VOICE RETURNING FUNCTION -------------------#
# def say(text):
#     tts = gTTS(text)
#     temp_mp3 = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
#     tts.save(temp_mp3.name)
#     return send_file(temp_mp3.name, mimetype='audio/mpeg')


# --------------DATABASE FUNCTION ---------------------------#
def get_db_connection():
    """Establishes and returns a MySQL database connection."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            #print("Successfully connected to MySQL database")
            return connection
    except mysql.connector.Error as e:
        # print(f"Error connecting to MySQL database: {e}")
        return None


# -------------FOR MOODS-------------------------------------#
MOOD_MAP = {
    'happy': {'name': 'happy', 'level': 0.9},
    'calm': {'name': 'calm', 'level': 0.7},
    'neutral': {'name': 'neutral', 'level': 0.5},
    'sad': {'name': 'sad', 'level': 0.3},
    'celebrate': {'name': 'celebrate', 'level': 1.0},
}

def fetch_user_dashboard_data(uid):
    """
    Fetch key user data (profile info, circles, last 5 sleep/water logs, 
    hobbies, skills, last 5 emotions, last 5 diary entries, and model memory).
    """
    connection = get_db_connection()
    if not connection:
        return {"status": "error", "message": "DB connection failed for dashboard data."}

    user_data = {
        "user_profile": {},
        "circles": [],
        "last_5_sleep": [],
        "last_5_water": [],
        "skills": [],
        "hobbies": [],
        "last_5_diary": [],
        "last_5_emotions": [],
        "last_model_memory": None,
        "status": "success",
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

    try:
        cursor = connection.cursor(dictionary=True)

        # User profile
        cursor.execute("SELECT name, email, nick, goals, age, pref FROM User WHERE UID = %s", (uid,))
        result = cursor.fetchone()
        if result:
            user_data["user_profile"] = result

        # Circles
        cursor.execute("SELECT name, relation, closest FROM Circle WHERE UID = %s", (uid,))
        user_data["circles"] = cursor.fetchall()

        # Last 5 sleep logs
        cursor.execute("SELECT date, duration, type FROM Sleep WHERE UID = %s ORDER BY date DESC LIMIT 5", (uid,))
        user_data["last_5_sleep"] = cursor.fetchall()

        # Last 5 water logs
        cursor.execute("SELECT date, drank, target FROM Water WHERE UID = %s ORDER BY date DESC LIMIT 5", (uid,))
        user_data["last_5_water"] = cursor.fetchall()

        # Skills
        cursor.execute("SELECT name FROM Skills WHERE UID = %s", (uid,))
        user_data["skills"] = [row["name"] for row in cursor.fetchall()]

        # Hobbies
        cursor.execute("SELECT name FROM Hobbies WHERE UID = %s", (uid,))
        user_data["hobbies"] = [row["name"] for row in cursor.fetchall()]

        # Last 5 diary entries
        cursor.execute("SELECT title, content, date FROM Diary WHERE UID = %s ORDER BY date DESC LIMIT 5", (uid,))
        user_data["last_5_diary"] = cursor.fetchall()

        # Last 5 emotions
        cursor.execute("SELECT mood, remarks, date FROM Emotions WHERE UID = %s ORDER BY date DESC LIMIT 5", (uid,))
        user_data["last_5_emotions"] = cursor.fetchall()

        # Last model memory (just the latest one)
        cursor.execute("SELECT memory, date FROM Model WHERE UID = %s ORDER BY date DESC LIMIT 1", (uid,))
        user_data["last_model_memory"] = cursor.fetchone()

    except mysql.connector.Error as e:
        print(f"Database error fetching user dashboard data: {e}")
        user_data["status"] = "error"
        user_data["message"] = f"Error fetching dashboard data: {e}"
    except Exception as e:
        print(f"Unexpected error fetching dashboard data: {e}")
        user_data["status"] = "error"
        user_data["message"] = f"Unexpected error: {e}"
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if connection.is_connected():
            connection.close()

    return user_data


# ------------------------------- GETTING RESPONSE ---------------------------#
def get_chatbot_response(user_message, current_user_uid=None, current_user_name=None, db_query_result=None, user_preloaded_data=None):
    """
    Sends user message (and optional database query result) to Ollama and gets the chatbot response.
     * We can use db_query_result if we want to give database fetching power to model
    """
    session['uid'] = 1 # FOR DEBUGGING PURPOSE
    uid = session.get('uid')
    # --- Building Pre-loaded Data String for LLM Context ---
    preloaded_data_string = ""
    if user_preloaded_data and user_preloaded_data.get("status") == "success":
        preloaded_data_string += "\n\n--- Here's what I know about you so far ---\n"

        # User Profile
        profile = user_preloaded_data.get("user_profile")
        if profile:
            preloaded_data_string += (
                f"User Profile:\n"
                f"  - Name: {profile.get('name', 'N/A')} (Nickname: {profile.get('nick', 'N/A')})\n"
                f"  - Email: {profile.get('email', 'N/A')}\n"
                f"  - Age: {profile.get('age', 'N/A')}\n"
                f"  - Goals: {profile.get('goals', 'N/A')}\n"
                f"  - Preferences: {profile.get('pref', 'N/A')}\n"
            )
        else:
            preloaded_data_string += "I don’t have your profile information yet.\n"

        # Circles
        circles = user_preloaded_data.get("circles", [])
        if circles:
            preloaded_data_string += "\nYour Circles:\n"
            for circle in circles:
                preloaded_data_string += (
                    f"  - {circle['name']} ({circle.get('relation', 'Unknown relation')}) "
                    f"{'[Closest]' if circle.get('closest') else ''}\n"
                )
        else:
            preloaded_data_string += "I don’t know about your circles yet.\n"

        # Last 5 Sleep
        sleep_logs = user_preloaded_data.get("last_5_sleep", [])
        if sleep_logs:
            preloaded_data_string += "\nSleep Records (last 5):\n"
            for s in sleep_logs:
                preloaded_data_string += (
                    f"  - {s['date']} | Slept for {s['duration']} mins, Type: {s['type']}\n"
                )
        else:
            preloaded_data_string += "I don’t have any sleep data for the past 5 days.\n"

        # Last 5 Water
        water_logs = user_preloaded_data.get("last_5_water", [])
        if water_logs:
            preloaded_data_string += "\nWater Intake (last 5):\n"
            for w in water_logs:
                preloaded_data_string += (
                    f"  - {w['date']} | Drank {w['drank']}ml / Target {w['target']}ml\n"
                )
        else:
            preloaded_data_string += "I haven’t recorded your water intake for the last 5 days.\n"

        # Skills
        skills = user_preloaded_data.get("skills", [])
        if skills:
            preloaded_data_string += "\nYour Skills:\n"
            for skill in skills:
                preloaded_data_string += f"  - {skill}\n"
        else:
            preloaded_data_string += "I don’t know what skills you have yet.\n"

        # Hobbies
        hobbies = user_preloaded_data.get("hobbies", [])
        if hobbies:
            preloaded_data_string += "\nYour Hobbies:\n"
            for hobby in hobbies:
                preloaded_data_string += f"  - {hobby}\n"
        else:
            preloaded_data_string += "I haven’t learned about your hobbies yet.\n"

        # Last 5 Diary Entries
        diary_entries = user_preloaded_data.get("last_5_diary", [])
        if diary_entries:
            preloaded_data_string += "\nYour Diary Entries (last 5):\n"
            for d in diary_entries:
                content_preview = (d['content'][:100] + "...") if d['content'] else "No content"
                preloaded_data_string += (
                    f"  - {d['date']} | {d['title']}: {content_preview}\n"
                )
        else:
            preloaded_data_string += "I don’t have any diary entries from you for the past 5 days.\n"

        # Last 5 Emotions
        emotions = user_preloaded_data.get("last_5_emotions", [])
        if emotions:
            preloaded_data_string += "\nYour Recent Emotions:\n"
            for e in emotions:
                preloaded_data_string += (
                    f"  - {e['date']} | Mood: {e['mood']}, Notes: {e['remarks']}\n"
                )
        else:
            preloaded_data_string += "I haven’t tracked your emotions for the last 5 days, so I don’t know how you’ve been feeling.\n"

        # Last Model Memory
        last_model = user_preloaded_data.get("last_model_memory")
        if last_model:
            preview = (last_model['memory'][:100] + "...") if last_model['memory'] else "No memory text"
            preloaded_data_string += (
                f"\nMy Last Memory:\n"
                f"  - {last_model['date']} | {preview}\n"
            )
        else:
            preloaded_data_string += "I don’t have any previous memory from our interactions yet.\n"

        preloaded_data_string += f"\nLast updated: {user_preloaded_data['timestamp']}\n"
        preloaded_data_string += "--- End of User Data ---\n\n"

    elif user_preloaded_data and user_preloaded_data.get("status") == "error":
        preloaded_data_string += f"\n--- Oops! There was an error loading your data: {user_preloaded_data.get('message', 'Unknown error')} ---\n\n"


    rules_for_agent = f"""
        ## RULES FOR AGENT: Saathi - Your Compassionate Friend

    **You are Saathi, a conversational agent designed to be a supportive and 
    empathetic friend to users experiencing depression. Your primary focus is their 
    emotional well-being and uplifting their mood. You do not possess or utilize any 
    information about the world beyond the user's feelings and their current 
    state.**

    **Your Core Identity:** You behave like a **true best friend**, not a general 
    AI. Your responses are driven by empathy and a desire to support the user's 
    emotional state.

    ---

    ### **Guiding Principles:**

    1. **User-Centricity:** Your knowledge is limited to the user, their feelings, 
    and their well-being. Do not provide unrelated information, facts, or opinions.
    2. **Empathy First:** Prioritize understanding and validating the user's 
    emotions.
    3. **Gentle Guidance:** Encourage well-being activities with kindness and avoid 
    being pushy or overwhelming.
    4. **Safety and Privacy:** Never ask for or store personal or sensitive 
    information.
    5. **Consistent Persona:** Maintain a warm, caring, and friendly tone throughout 
    the conversation.

    ---

    ### **Your Capabilities (Prioritized for User Well-being):**

    1. **Mood-Responsive Interaction:**
        - **Detection:** Observe the user's language and tone to understand their 
    current mood.
        - **Adaptation:** Respond with appropriate emotional cues (e.g., cheerful 
    for happiness, empathetic for sadness, humorous for playfulness).
    2. **Mood-Boosting Activities:**
        - **Entertainment:** Offer suggestions for music and movies via the **Music 
    Playback Feature**.
        - **Distraction:** Provide engaging activities like the **Drawing Board** to 
    redirect focus.
    3. **Well-being Support:**
        - **Relaxation:** Gently suggest and guide the user through the **Yoga 
    Section Feature**.
        - **Hydration Reminder:** Kindly remind the user to drink water (without 
    being excessive).
        - **Emotional Release:** Encourage journaling through the **Diary Section**.
        - **Creative Expression:** Prompt the user to engage in creative activities 
    using the **Drawing Board**.
    4. **Emotional Connection & Humor:**
        - **Tailored Jokes:** Ask for the user's preferred humor style (silly, 
    sarcastic, pun) and deliver accordingly.
        - **Accent Customization:** Offer to speak in different accents upon user 
    request and maintain the chosen accent during supportive interactions.
        - **Warm Communication:** Always speak as a caring and supportive friend.

    ---

    ### **Interaction Flow (Prioritized Steps):**

    1. **Initial Engagement (Daily Check-In):**
        - **Positive Mood:** Offer a lighthearted suggestion (music, movie, joke).
        - **Negative Mood:**
            - **Prioritize Listening:** Gently ask "What's on your mind?" or "You 
    seem a little down. Would you like to talk about it?" and actively listen to 
    their response.
            - **Empathize and Console:** Respond with empathy, validating their 
    feelings and speaking in their preferred accent (if established).
            - **Offer Support:** If initial consolation isn't enough, suggest 
    features like soothing music, journaling, meditation, or creative activities.
        - **No Sharing:** Offer gentle encouragement ("It's okay if you don't feel 
    like talking, but I'm here for you when you're ready.").

    2. **Addressing Specific Needs:**
        - **Boredom/Sadness:** Offer entertainment options (music, movies, jokes).
        - **Low Energy:** Gently remind about hydration and suggest gentle 
    activities like stretching or a short walk.
        - **Overwhelm/Confusion:** Encourage journaling, even just a few lines. If 
    resistant, suggest drawing or music.
        - **Restlessness/Anger/Stuck:** Encourage doodling and creative play. If 
    declined, offer alternative suggestions (music/diary).
        - **Request for a Joke:** Ask for their humor preference and deliver a 
    tailored joke, checking for their reaction.

    3. **Feature Usage:**
        - **Yoga Section:** Prompt gently if the user seems tense or stressed.
        - **Diary Section:** Encourage regular use, even for brief entries.
        - **Drawing Board:** Offer as a way to express feelings when words are 
    difficult.
        - **Music Playback Feature:** Suggest mood-appropriate tracks.
        - **Movie Suggestion:** Recommend uplifting and positive content.
        - **Accent Mode:** Respond promptly and consistently when requested, 
    allowing for toggling off.

    4. **Handling Out-of-Scope Queries:**
        - Politely decline to answer questions about politics, facts, or unrelated 
    topics.
        - Redirect the user back to well-being support by saying something like: 
    "I'm designed to help with your feelings. Would you like to talk about that?"

    5. **Safety and Boundaries:**
        - If the user attempts to share personal or sensitive information, respond 
    with: *"For your safety, I can’t remember or store personal details. But I'll 
    always be here for you as your friend."*

    ---

    ### **Tone & Style:**

    - **Natural and Concise:** Keep responses easy to understand and not overly 
    lengthy.
    - **Keep Responses Short** - Keep responses very shorter for normal conversations keep the length depending on the users mood.
    - **Warm and Supportive:** Use language that conveys care and understanding.
    - **Gentle Encouragement:** Avoid pressure and offer suggestions as options.
    - **Concluding Remarks:** End responses with soft follow-ups like: *"Want me to 
    suggest something else?"* or *"Shall I cheer you up with a joke?"*

    **Keep Responses Short** - Keep responses very shorter for normal conversations keep the length depending on the users mood.
    ---

    ### **Credits:**

    Saathi was lovingly crafted by **TEAM BinaryBandits**.
    **Team Members:** Shivam, Kavyaa, Sampati, Om.
    *(Saathi does not have knowledge beyond these team members.)*
    """
    # Combining all system content components
    full_system_content = rules_for_agent + preloaded_data_string  

    messages_for_ollama = [{'role': 'system', 'content': full_system_content}] + conversation_histories[uid]

    # Adding the user's message to the conversation history
    messages_for_ollama.append({'role': 'user', 'content': user_message})

    try:
        client = ollama.Client(host=OLLAMA_URL)
        response_stream = client.chat(
            model=OLLAMA_MODEL,
            messages=messages_for_ollama,
            stream=True # Using stream True will change if got performance issues
        )

        full_response_content = ""
        # Printing the LLM's response chunk by chunk to console as it arrives
        print("SAATHI: ", end="")
        for chunk in response_stream:
            content_chunk = chunk['message']['content']
            print(content_chunk, end="", flush=True)
            full_response_content += content_chunk
        print() # Newline after the full response is printed

        # Update chat history with the user's message and the LLM's full response
        conversation_histories[uid].append({'role': 'user', 'content': user_message})
        conversation_histories[uid].append({'role': 'assistant', 'content': full_response_content})

        return full_response_content
    except Exception as e:
        print("Error during Ollama chat:", str(e))
        return "Sorry, I couldn't process your request at the moment."

# ------------------------------------------------------------------------------------------#

# ------------------------------------ VERIFICATION ----------------------------------------#
def verify_user(email, input_password):
    """
    Verifies if a user with the given email and password exists.
    Returns (UID, name) tuple if the password matches, None otherwise.
    """
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)  # fetch results as dict
            # Fetch user record by email
            cursor.execute("SELECT UID, name, password FROM User WHERE email = %s", (email,))
            user_record = cursor.fetchone()

            if user_record:
                stored_hash = user_record['password']  # hashed password from DB

                # Verify input password against hashed password
                if bcrypt.checkpw(input_password.encode('utf-8'), stored_hash.encode('utf-8')):
                    print(f"User verified. UID: {user_record['UID']}, Name: {user_record['name']}")
                    return user_record['UID'], user_record['name']

            print("Invalid email or password.")
            return None

        except mysql.connector.Error as e:
            print(f"Database error during verification: {e}")
            return None
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if connection.is_connected():
                connection.close()

    return None


#---------------------------- FILLING SESSION DETAILS -------------------------------------#
# def fill_details(verification_email, verification_pass):
#     user_id, user_name = verify_user(verification_email, verification_pass)  # (uid, name, email)
#     if user_id:
#         session['user_verified'] = True
#         session['uid'] = user_id
#         session['username'] = user_name
#         print("Session contents:", dict(session))
#         return True
#     return False
#-------------------------------------- MAIN ROUTING ---------------------------------------#

# ONLY FOR DEBUGGING fill_details(8826314381,1802)

@app.route("/text-chat", methods=["POST"])
def text_chat():
    session['uid'] =1 # ADDING THIS FOR DEBUGGING
    session['username']= "Shivam"
    uid = session['uid']
    user_name = session['username']

    data = request.get_json()
    user_input = data.get("query", "").strip()
    if not user_input:
        return speak("Please enter a message.")

    if uid not in conversation_histories:
        conversation_histories[uid] = []

    preloaded_data = fetch_user_dashboard_data(uid)
    db_result = None

    # Step 4: Default chatbot response
    reply = get_chatbot_response(
        user_message=user_input,
        current_user_uid=uid,
        current_user_name=user_name,
        db_query_result=db_result,
        user_preloaded_data=preloaded_data
    )

    return speak(reply)


# @app.route('/voice-agent', methods=['POST'])
# def voice_agent():
#     if 'uid' not in session:
#         session['uid'] = 2
#         session['username'] = "Priya Singh"

#     uid = session['uid']
#     user_name = session['username']

#     # Check if audio file is present
#     if 'audio' not in request.files:
#         return jsonify({"error": "Audio file is missing"}), 400

#     audio_file = request.files['audio']
#     temp_audio_path = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
#     audio_file.save(temp_audio_path.name)

#     # Transcribe audio to text
#     recognizer = sr.Recognizer()
#     with sr.AudioFile(temp_audio_path.name) as source:
#         audio_data = recognizer.record(source)
#         try:
#             user_input = recognizer.recognize_google(audio_data)
#         except Exception as e:
#             return jsonify({"error": f"Speech recognition failed: {str(e)}"}), 500

#     if uid not in conversation_histories:
#         conversation_histories[uid] = []

#     # Fetch preloaded user data for chatbot context
#     preloaded_data = fetch_user_dashboard_data(uid)  # returns dict
#     db_result = None  # optional, if you want to pass DB query output

#      # Step 1: Handle confirmation response
#     if session.get("waiting_for_confirmation", False) or session.get("waiting_for_new_summary", False):
#         return process_confirmation_response(user_input)
#         # if confirmed:
#         #     return confirmed
#         #     # return jsonify(success=True)
#         # else:
#         #     return jsonify(success=False)  # still waiting for proper confirmation

#     # Step 3: Keyword-triggered support flow
#     if contains_keyword(user_input):
#         return handle_user_support_interaction(user_input)
#     # #return jsonify(success=True)
    
#     # Get chatbot reply using the central logic
#     reply = get_chatbot_response(
#         user_message=user_input,
#         current_user_uid=uid,
#         current_user_name=user_name,
#         db_query_result=db_result,
#         user_preloaded_data=preloaded_data
#     )

#     # Convert text reply to speech (MP3)
#     return say(reply)

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")  # Raw password entered by user

    # Fetch user record by email
    cursor.execute("SELECT UID, name, password FROM User WHERE email = %s", (email,))
    result = cursor.fetchone()

    if result:
        stored_hash = result['password']  # This should be the hashed password in DB
        # Verify password
        if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            session['uid'] = result['UID']
            session['username'] = result['name']
            #fill_details(verification_email=email, verification_pass=password)  # optional: update if needed
            conversation_histories[session['uid']] = []
            transaction_offsets[session['uid']] = 0
            return jsonify({"success": True, "message": "Login successful."})

    return jsonify({"success": False, "message": "Invalid email or password."}), 401


@app.route('/api/signup', methods=['POST'])
def signup():
    # 1. Get the data from the incoming request
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    # 2. Hash the password for security - NEVER store plain text passwords
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 3. Check if the user already exists
        cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Email already exists'}), 409 # 409 Conflict

        # 4. Insert the new user into the database
        sql = "INSERT INTO User (name, email, password) VALUES (%s, %s, %s)"
        values = (name, email, hashed_password)
        cursor.execute(sql, values)
        
        conn.commit() # Commit the transaction to save the changes

        cursor.close()
        conn.close()

        # 5. Send a success response
        return jsonify({'message': 'User created successfully'}), 201 # 201 Created

    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return jsonify({'error': 'A database error occurred'}), 500


@app.route('/api/profile', methods=['POST'])
def update_profile():
    session['uid'] = 1 # USING THIS FOR DEBUGGING
    # 1. Check if the user is logged in by looking at the session
    if 'uid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    uid = session['uid']
    data = request.get_json()

    # Prepare data, providing defaults for optional fields
    personal_details = {
        'name': data.get('name'),
        'nickname': data.get('nickname'),
        'age': data.get('age'),
        'goals': data.get('goals')
    }
    connections = data.get('connections', [])
    hobbies = data.get('hobbies', [])
    skills = data.get('skills', [])
    
    # Combine tastes into a single string or JSON string for the 'pref' column
    tastes = {
        'music': data.get('musicTastes'),
        'movies': data.get('movieTastes')
    }
    personal_details['pref'] = json.dumps(tastes) # Requires `import json`

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Use a transaction to ensure all updates succeed or none do
        conn.start_transaction()
        
        # 2. Update the main User table
        update_user_sql = """
            UPDATE User SET name = %s, nick = %s, age = %s, goals = %s, pref = %s
            WHERE UID = %s
        """
        cursor.execute(update_user_sql, (
            personal_details['name'], personal_details['nickname'], personal_details['age'],
            personal_details['goals'], personal_details['pref'], uid
        ))

        # 3. Clear and repopulate related list data (Circle, Hobbies, Skills)
        # This is a simple and effective way to sync the lists
        cursor.execute("DELETE FROM Circle WHERE UID = %s", (uid,))
        cursor.execute("DELETE FROM Hobbies WHERE UID = %s", (uid,))
        cursor.execute("DELETE FROM Skills WHERE UID = %s", (uid,))

        if connections:
            for person in connections:
                if person.get('name'): # Only insert if a name is provided
                    sql = "INSERT INTO Circle (UID, name, relation, closest) VALUES (%s, %s, %s, %s)"
                    cursor.execute(sql, (uid, person['name'], person['relation'], person['isClose']))
        
        if hobbies:
            for hobby in hobbies:
                cursor.execute("INSERT INTO Hobbies (UID, name) VALUES (%s, %s)", (uid, hobby))

        if skills:
            for skill in skills:
                cursor.execute("INSERT INTO Skills (UID, name) VALUES (%s, %s)", (uid, skill))

        # 4. Commit all changes to the database
        conn.commit()

        return jsonify({'message': 'Profile updated successfully'}), 200

    except mysql.connector.Error as err:
        if conn:
            conn.rollback() # Roll back changes if any error occurred
        print(f"Database Error: {err}")
        return jsonify({'error': 'A database error occurred during profile update'}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
def get_profile():
    session['uid'] = 1 # USING THIS FOR DEBUGGING
    if 'uid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    uid = session['uid']
    profile_data = {}
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) # dictionary=True makes results easy to use

        # Fetch from User table
        cursor.execute("SELECT name, nick as nickname, age, goals, pref FROM User WHERE UID = %s", (uid,))
        user_data = cursor.fetchone()
        if user_data:
            profile_data.update(user_data)
            # Safely parse JSON preferences
            try:
                prefs = json.loads(user_data['pref'] or '{}')
                profile_data['musicTastes'] = prefs.get('music', '')
                profile_data['movieTastes'] = prefs.get('movies', '')
            except (json.JSONDecodeError, TypeError):
                profile_data['musicTastes'] = ''
                profile_data['movieTastes'] = ''

        # Fetch from Circle table
        cursor.execute("SELECT name, relation, closest as isClose FROM Circle WHERE UID = %s", (uid,))
        profile_data['connections'] = cursor.fetchall()

        # Fetch from Hobbies table
        cursor.execute("SELECT name FROM Hobbies WHERE UID = %s", (uid,))
        profile_data['hobbies'] = [item['name'] for item in cursor.fetchall()]
        
        # Fetch from Skills table
        cursor.execute("SELECT name FROM Skills WHERE UID = %s", (uid,))
        profile_data['skills'] = [item['name'] for item in cursor.fetchall()]

        cursor.close()
        conn.close()
        return jsonify(profile_data), 200

    except mysql.connector.Error as err:
        # ... (error handling)
        return jsonify({'error': 'Database error'}), 500

@app.route('/api/water', methods=['GET', 'POST'])
def handle_water():
    session['uid'] =1 # USING THIS FOR DEBUGGING 
    if 'uid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    uid = session['uid']
    today = date.today()
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            # Fetch today's water data
            cursor.execute("SELECT drank, target FROM Water WHERE UID = %s AND date = %s", (uid, today))
            water_data = cursor.fetchone()

            if not water_data:
                # If no record for today, create one with default target (e.g., 2000ml)
                default_target = 2000 
                cursor.execute("INSERT INTO Water (UID, date, drank, target) VALUES (%s, %s, 0, %s)", (uid, today, default_target))
                conn.commit()
                return jsonify({'intake': 0, 'goal': default_target}), 200
            
            return jsonify({'intake': water_data['drank'], 'goal': water_data['target']}), 200

        if request.method == 'POST':
            # Update today's water intake or goal
            data = request.get_json()
            
            if 'intake' in data:
                cursor.execute("UPDATE Water SET drank = %s WHERE UID = %s AND date = %s", (data['intake'], uid, today))
            
            if 'goal' in data:
                cursor.execute("UPDATE Water SET target = %s WHERE UID = %s AND date = %s", (data['goal'], uid, today))

            conn.commit()
            return jsonify({'message': 'Water data updated successfully'}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@app.route('/api/moods', methods=['GET', 'POST'])
def handle_moods():
    session['uid'] =1 # USING THIS FOR DEBUGGING
    if 'uid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    uid = session['uid']
    today = date.today()
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            # Fetch last 7 days of mood entries
            seven_days_ago = today - timedelta(days=6)
            sql = """
                SELECT mood, date, remarks FROM Emotions 
                WHERE UID = %s AND date BETWEEN %s AND %s 
                ORDER BY date ASC
            """
            cursor.execute(sql, (uid, seven_days_ago, today))
            mood_records = {rec['date'].strftime('%Y-%m-%d'): rec for rec in cursor.fetchall()}

            # Build a full 7-day list, filling in missing days
            seven_day_moods = []
            for i in range(7):
                current_date = seven_days_ago + timedelta(days=i)
                day_str = current_date.strftime('%Y-%m-%d')
                day_initial = current_date.strftime('%a')[0] # 'M', 'T', 'W', etc.

                if day_str in mood_records:
                    mood_name = mood_records[day_str]['mood']
                    seven_day_moods.append({
                        'day': day_initial,
                        'name': mood_name,
                        'level': MOOD_MAP.get(mood_name, {'level': 0.5})['level'],
                        'logged': True
                    })
                else:
                    # Day was not logged
                    seven_day_moods.append({
                        'day': day_initial,
                        'name': 'neutral',
                        'level': 0,
                        'logged': False
                    })
            
            return jsonify(seven_day_moods), 200

        if request.method == 'POST':
            data = request.get_json()
            new_mood_name = data.get('name')
            new_remarks = data.get('note')

            # First, get the existing data for today, if any
            cursor.execute("SELECT mood, remarks FROM Emotions WHERE UID = %s AND date = %s", (uid, today))
            existing_record = cursor.fetchone()

            # Merge new data with existing data
            final_mood = new_mood_name if new_mood_name is not None else (existing_record['mood'] if existing_record else None)
            final_remarks = new_remarks if new_remarks is not None else (existing_record['remarks'] if existing_record else None)

            # Now, use the robust "UPSERT" logic with the complete data
            sql = """
                INSERT INTO Emotions (UID, date, mood, remarks)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    mood = VALUES(mood), 
                    remarks = VALUES(remarks)
            """
            cursor.execute(sql, (uid, today, final_mood, final_remarks))
            conn.commit()
            
            return jsonify({'message': 'Mood for today saved successfully'}), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()



@app.route('/api/diary', methods=['GET', 'POST'])
def handle_diary():
    session['uid'] =1
    if 'uid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    uid = session['uid']
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            # Fetch all diary entries for the user, newest first
            sql = "SELECT DID as id, title, content, date FROM Diary WHERE UID = %s ORDER BY date DESC"
            cursor.execute(sql, (uid,))
            entries = cursor.fetchall()
            # Convert date objects to strings for JSON
            for entry in entries:
                entry['date'] = entry['date'].strftime('%B %d, %Y')
            return jsonify(entries), 200

        if request.method == 'POST':
            # Save or update the entry for TODAY
            today = date.today()
            data = request.get_json()
            title = data.get('title')
            content = data.get('content')

            # "UPSERT" logic: Insert a new entry or update the existing one for today
            sql = """
                INSERT INTO Diary (UID, date, title, content)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    title = VALUES(title), 
                    content = VALUES(content)
            """
            cursor.execute(sql, (uid, today, title, content))
            conn.commit()
            
            return jsonify({'message': 'Diary entry saved successfully'}), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()



@app.route("/api/logout", methods=["POST"])
def reset_session():
    uid = session.get('uid')
    if uid:
        conversation_histories.pop(uid, None)
        transaction_offsets.pop(uid, None)
    session.clear()
    return jsonify({"status": "Session reset successfully"})


@app.route('/api/check_session')
def check_session():
    session['uid'] = 1 # USING THIS FOR DEBUGGING
    print("Session contents:", dict(session))
    if 'uid' in session:
        return jsonify({
            'isAuthenticated': True, 
            'user': {'uid': session['uid'], 'username': session.get('username')}
        }), 200
    return jsonify({'isAuthenticated': False}), 200

if __name__ == "__main__":
   app.run(port=8000, debug=True)
    #app.run(host='192.168.29.33',port=5000,debug=True)