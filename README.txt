WORDLONG - Wordle with 6 to 10 letter words, and 2-player duels

NEEDS: Node.js 16 or newer (free, from nodejs.org). Nothing else to install.

START
  Windows:    double-click start-windows.bat
  Mac/Linux:  run ./start-mac-linux.sh   (or: node server.js)
The game opens at http://localhost:3000 and the terminal prints a
"Friend" address for people on the same Wi-Fi.

PLAY SOLO
  Solo tab -> pick 6 to 10 letters -> guess.

PLAY WITH A FRIEND (one of you runs the server)
  1. Host: start the app. Friend: open the "Friend" address from the terminal
     in their browser (same Wi-Fi). For different networks, see below.
  2. Both: open the "Duel with a friend" tab and enter your name.
  3. Host: choose Swap words (each picks a secret word for the other) or
     Same random word, then Create room. A 6-character join key appears.
  4. Friend: type the join key under "Join a room".
  5. First to solve gets the point. Start more rounds; the score carries over.

PLAY ON PHONES (host once, then share one link)
  1. Make a free GitHub account and create a new repository.
  2. Upload everything in this folder to it (GitHub's "Add file > Upload files"
     works from a phone or computer).
  3. Make a free Render account (render.com), choose New > Blueprint, pick your
     repository, and deploy. Render reads render.yaml for you.
  4. Render gives you a link like https://wordlong-xxxx.onrender.com.
     Both of you open it in your phone browser. Tip: use "Add to Home Screen".
  5. Open "Duel with a friend", enter names, one creates a room, the other types
     the 6-character join key.
  Notes: the free plan sleeps after about 15 minutes idle, so the first load can
  take up to a minute. A restart clears rooms, so make a new room each session.
  Any Node or Docker host (Railway, Fly.io, Koyeb) also works with this folder.

DIFFERENT NETWORKS
  Host runs one of these while the app is running, then shares the https link:
    npx cloudflared tunnel --url http://localhost:3000
    npx localtunnel --port 3000
  Or deploy this folder to any Node host (Render, Railway, Fly.io); it reads PORT.

NOTES
  Rooms live in the server's memory and clear when it stops (or after 24 hours).
  Secret words are lightly obfuscated, not encrypted, so don't inspect network
  traffic if you want a fair game.
  Change the port: PORT=4000 node server.js
