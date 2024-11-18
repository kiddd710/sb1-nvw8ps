import { PublicClientApplication, Configuration, AuthenticationResult } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
msalInstance.initialize().then(() => {
  // Check if there are already accounts signed in
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }
});

export const loginRequest = {
  scopes: ['User.Read', 'profile', 'openid', 'email']
};

export async function handleLogin(): Promise<AuthenticationResult> {
  try {
    // Check if there's a cached account
    const account = msalInstance.getActiveAccount();
    if (account) {
      // Try silent token acquisition first
      try {
        return await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account
        });
      } catch (silentError) {
        console.log('Silent token acquisition failed, falling back to popup');
      }
    }
    // If no cached account or silent acquisition failed, try popup
    return await msalInstance.loginPopup(loginRequest);
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}