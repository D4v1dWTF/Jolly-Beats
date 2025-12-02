# Jolly Beats

## 1. Project Info

**Project Name:** Jolly Beats

**Group Info:**
- Group Number: 50
- Student Names:
- Wong Tsz Fung 14103405,
- Wan Kai Ho 14030992,
- Cheung Ho Him 14112057,
- Holly Lei Stephenson 13244241


## 2. Project File Intro

**server.js:** Main server file that sets up Express application, connects to MongoDB, configures session management, and mounts all route handlers. It initializes the server on port 3000 and handles middleware setup for static files, body parsing, and view engine configuration.

**package.json:** Lists all project dependencies including express, mongoose, ejs, express-session, connect-mongo, dotenv, and multer. Also contains scripts for starting the server and development mode with nodemon.

**public (folder):** Contains static files for the website:
- css/style.css: Main stylesheet with all styling for the website
- js/fontsize.js: JavaScript for text size adjustment functionality

**views (folder):** Contains all EJS template files for rendering web pages:
- index.ejs: Home page
- login.ejs: User login page
- register.ejs: User registration page
- songs.ejs: Page displaying user's uploaded songs
- uploadSong.ejs: Form for uploading new songs
- editSong.ejs: Form for editing existing songs
- browseSongs.ejs: World page showing all users' songs
- playlists.ejs: Page displaying user's playlists
- createPlaylist.ejs: Form for creating new playlists
- playlistDetail.ejs: Page showing details of a specific playlist
- forum.ejs: Forum discussion page
- profile.ejs: User profile and achievements page

**models (folder):** Contains Mongoose schema definitions:
- User.js: User model with username, email, password, avatar, and displayName
- Song.js: Song model with title, artist, filename, ratings, and uploadedBy reference
- Playlist.js: Playlist model with name, description, songs array, and owner reference
- Post.js: Forum post model with content, author, likes, and replies
- Achievement.js: Achievement tracking model for user achievements

## 3. Cloud Based Server URL

https://jolly-beats.onrender.com

## 4. Operation Guides

### Use of Login/Logout Pages

**Valid Login Information:**
- Username: admin
- Password: 123456

- or you can try to make a new account to test

**Register Steps**
1. Navigate to the website URL
2. Click on "Register" button
3. Enter username, email(no need to enter a real email, just make sure enter the correct format like: test@test.com) and password
4. Click "Submit" button to submit
5. Enter the username and password on the Login page

**Sign In Steps:**
1. Navigate to the website URL
2. Click on "Login" button
3. Enter username and password
4. Click "Login" button to submit

**Logout:**
- Click on "Logout" button in the right upper corner (shown as "Logout (username)")
- Session will be destroyed and you will be redirected to the home page

### Use of CRUD Web Pages

**CREATE:**
- Songs: Click "Upload New Song" button on My Songs page, fill in title and artist, select music file, then click "Upload Song"
- Playlists: Click "Create Playlist" button on Playlists page, enter name and description, then click "Create". To add song in your playlist, go to Home page or World page and there will be a "add to playlist" button. Click it and select the playlist you would like to add
- Forum Posts: On Forum page, enter post content, optionally select a song, then click "Post"

**READ:**
- Songs: View all your uploaded songs on "My Songs" page. Use search bar to filter by title or artist
- All Songs: Click "World" in navigation to browse all users' songs
- Playlists: View all your playlists on "Playlists" page, click "Play & Manage" to see playlist details
- Forum: View all forum posts on "Forum" page, click on posts to see replies

**UPDATE:**
- Songs: On My Songs page, click "Edit" button next to a song, modify title or artist, then click "Update Song"
- Profile: On Profile page, change display name or password using the respective forms

**DELETE:**
- Songs: On My Songs page, click "Delete" button next to a song, confirm deletion
- Playlists: On Playlist detail page, click "Delete Playlist" button, confirm deletion
- Forum Posts: On Forum page, click "Delete" button on your own posts, confirm deletion

### Use of RESTful CRUD Services

**API Endpoints:**

**GET Read:**
- GET /api/songs: Get all songs
- GET /api/songs/:id: Get one song by ID
- GET /api/playlists: Get all playlists
- GET /api/posts: Get all forum posts

**POST Create:**
- POST /api/songs: Create a new song record (requires title, artist, filename, uploadedBy in JSON body)

**PUT Update:**
- PUT /api/songs/:id: Update a song by ID (requires title and artist in JSON body)

**DELETE Delete:**
- DELETE /api/songs/:id: Delete a song by ID

**CURL Testing Commands:**

Get all songs:
```
curl --ssl-no-revoke -X GET https://jolly-beats.onrender.com/api/songs
```

Get one song (replace SONG_ID with actual ID):
```
curl --ssl-no-revoke -X GET https://jolly-beats.onrender.com/api/songs/[SONG_ID]
```

Create a song:
```
curl --ssl-no-revoke -X POST https://jolly-beats.onrender.com/api/songs -H "Content-Type: application/json" -d "{\"title\":\"Test Song\",\"artist\":\"Test Artist\",\"filename\":\"test.mp3\",\"uploadedBy\":\"[USER_ID]\"}"
```

Update a song:
```
curl --ssl-no-revoke -X PUT https://jolly-beats.onrender.com/api/songs/[SONG_ID] -H "Content-Type: application/json" -d "{\"title\":\"Updated Title\",\"artist\":\"Updated Artist\"}"
```

Delete a song:
```
curl --ssl-no-revoke -X DELETE https://jolly-beats.onrender.com/api/songs/[SONG_ID]
```

Get all playlists:
```
curl --ssl-no-revoke -X GET https://jolly-beats.onrender.com/api/playlists
```

Get all forum posts:
```
curl --ssl-no-revoke -X GET https://jolly-beats.onrender.com/api/posts
```
