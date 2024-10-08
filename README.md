Landsat Reflectance Data: On the Fly and at Your Fingertips - 06/10/2024 - Version 1.0

The project can be reached at:
Website: http://127.0.0.1:5000

Authors:
_______

1. Warda Saleh    : warda.mu01@gmail.com
2. Jack Rubio     : rubiojack123@gmail.com
3. Pramit Shende  : pramitshende@gmail.com
4. Donyal Haji    : danyalalihaji@gmail.com
5. Kyle Lai Thom  : klaithom@gmail.com
6. Cameron Angle  : camronangled@gmail.com



Project Description:
___________________
Our system can support complete tracking and analysis of the Landsat 8 and Landsat 9 Satellites. Thus, the platform will increase user engagement 
in satellite data through real-time and analytical information. The following are some of the fundamental features:

1.	Overpass Notifications - The user receives notifications about the upcoming satellite overpasses, an option to indicate favorite or advance 
notice. Notifications of Overpass Time and Data Availability.
2.	Surface Reflectance Data - The system retrieves and processes the surface reflectance data over user-selected pixels, which can be made available in near
real-time, allowing users to compare with ground measurements and inform users for decision-making.
3.	Q&A - The system will provide timely and accurate responses to user questions involving satellite statuses, functionalities, and data specifics, keeping
users informed with the latest knowledge.
4.	Live Location Tracking via GPT - Request Current Live Location of Landsat 8 and Landsat 9 Satellites, including the exact coordinates with timestamps to enable tracking
of the position of the satellite in real time.


Running Instructions:
____________________
In the terminal of your IDE:
Install Node.js
Navigate to frontend folder: cd frontend
Run: npm install
Run: npm run build
Navigate back to project: cd ..
Navigate to flask_app folder: cd flask_app
Navigate to app folder in flask_app: cd app
Run the application with: 
  python app.py
OR
  python3 app.py
when running, commit 86abc4d from don-flask

Known Issues:
___________
- GEE API is not working
- GPT API



Installation (Node.js):
______________________
MacOS:

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 22
node -v # should print `v22.9.0`
npm -v # should print `10.8.3`

Windows:

winget install Schniz.fnm
fnm env --use-on-cd | Out-String | Invoke-Expression
fnm use --install-if-missing 22
node -v # should print `v22.9.0`
npm -v # should print `10.8.3`

Linux:

winget install Schniz.fnm
fnm env --use-on-cd | Out-String | Invoke-Expression
fnm use --install-if-missing 22
node -v # should print `v22.9.0`
npm -v # should print `10.8.3`


