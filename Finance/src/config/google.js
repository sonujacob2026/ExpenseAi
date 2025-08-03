// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = '973276495187-ngffqvjuu5sr1ao39baer6ec123pjldo.apps.googleusercontent.com';

// Initialize Google OAuth
export const initializeGoogleOAuth = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google OAuth can only be initialized in browser environment'));
      return;
    }

    // Check if Google Identity Services is loaded
    if (!window.google) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    try {
      // Initialize Google OAuth
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          // This will be handled by the component
          console.log('Google OAuth callback received');
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

// Trigger Google OAuth popup
export const signInWithGooglePopup = () => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    try {
      // Use the One Tap API
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: (response) => {
              if (response.access_token) {
                resolve(response);
              } else {
                reject(new Error('Failed to get access token'));
              }
            }
          }).requestAccessToken();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
