// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  // Replace messagingSenderId with yours
  'messagingSenderId': '504975596104'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  payload = payload.data;
  const notificationTitle = payload.title;
  const notificationOptions = {
    body: payload.body,
    icon: payload.icon_url,
  };

  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    clients.openWindow(payload.url);
  });

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});
// [END background_handler]

<!-- Firebase JS -->
<script src="https://www.gstatic.com/firebasejs/4.1.2/firebase.js"></script>
<script>
    // Initialize Firebase
    // Firebase Console --> Settings --> General
    // --> Register App --> Copy firebaseConfig
    const firebaseConfig = {
        ...
    };


    firebase.initializeApp(firebaseConfig);

    // Firebase Messaging Service
    const messaging = firebase.messaging();
    function sendTokenToServer(currentToken) {
        if (!isTokenSentToServer()) {
            // The API Endpoint will be explained at step 8
            $.ajax({
                url: "/api/devices/",
                method: "POST",
                async: false,
                data: {
                    'registration_id': currentToken,
                    'type': 'web'
                },
                success: function (data) {
                    console.log(data);
                    setTokenSentToServer(true);
                },
                error: function (err) {
                    console.log(err);
                    setTokenSentToServer(false);
                }
            });

        } else {
            console.log('Token already sent to server so won\'t send it again ' +
                'unless it changes');
        }
    }

    function isTokenSentToServer() {
        return window.localStorage.getItem("sentToServer") === "1";
    }

    function setTokenSentToServer(sent) {
        if (sent) {
            window.localStorage.setItem("sentToServer", "1");
        } else {
            window.localStorage.setItem("sentToServer", "0");
        }
    }


    function requestPermission() {
        messaging.requestPermission().then(function () {
            console.log("Has permission!");
            resetUI();
        }).catch(function (err) {
            console.log('Unable to get permission to notify.', err);
        });
    }

    function resetUI() {
        console.log("In reset ui");
        messaging.getToken().then(function (currentToken) {
            console.log(currentToken);
            if (currentToken) {
                sendTokenToServer(currentToken);
            } else {
                setTokenSentToServer(false);
            }
        }).catch(function (err) {
            console.log(err);
            setTokenSentToServer(false);
        });
    }

    messaging.onTokenRefresh(function () {
        messaging.getToken().then(function (refreshedToken) {
            console.log("Token refreshed.");
            // Indicate that the new Instance ID token has not yet been sent to the
            // app server.
            setTokenSentToServer(false);
            // Send Instance ID token to app server.
            sendTokenToServer(refreshedToken);
            resetUI();
        }).catch(function (err) {
            console.log("Unable to retrieve refreshed token ", err);
        });
    });

    messaging.onMessage(function (payload) {
        payload = payload.data;
        // Create notification manually when user is focused on the tab
        const notificationTitle = payload.title;
        const notificationOptions = {
            body: payload.body,
            icon: payload.icon_url,
        };

        if (!("Notification" in window)) {
            console.log("This browser does not support system notifications");
        }
        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification(notificationTitle, notificationOptions);
            notification.onclick = function (event) {
                event.preventDefault(); // prevent the browser from focusing the Notification's tab
                window.open(payload.url, '_blank');
                notification.close();
            }
        }
    });


    requestPermission();
</script>