// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBveY58mmXC3NEV5NhMvQ4MsexgCxGwhg",
  authDomain: "campusconnect-c0c45.firebaseapp.com",
  projectId: "campusconnect-c0c45",
  storageBucket: "campusconnect-c0c45.firebasestorage.app",
  messagingSenderId: "325560686716",
  appId: "1:325560686716:web:92c42d4b5cc448f20211f9",
  measurementId: "G-NW7ER0RK7K"
};

// Firebase service account
const serviceAccount = {
  type: "service_account",
  project_id: "campusconnect-c0c45",
  private_key_id: "bc369753d7062aac0112225233e7e7df74d02179",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCqbppCFxWfFcqf\nB9m7gVurwZQc90jlOhlp4XYZlw4B11oLu2qnF8/qbzInvxI2+emnRdeZjcv9gGzT\nKHRZGLiTq6bMa1IGm2YcTtRkJcIwyXn/zoRQgsc+XY3AuAtrMhkpkyXWXtFaSuqA\n5ZIo7pv9Z7Ta1eOEXb8dbnjaVmNlp+nW6mpn7HA8VoV0XGe54wzxFzKsiNY/2Rje\nukXPMqR7piQKgKu9uapQwndW828shwRo9ZhhIue9fJdT0jszw+ZV7tJbLIwNYell\nuynHh/QHj8vDhazA91Ckd4GyQTDfKiEwPNTYEcEhjgdR0k3n94V6UbZLbmsUyeuo\nweO3lAkfAgMBAAECggEAHfpRYNGdqHtVRg7D8hLJVJc6nbOzWzqScMjLFKo4uQMv\noAOpuVVbaXGAoXQe2JOx0Q3cY/KIkIDv415oxKkwAi19q9Quu+HGnrEQ88KeeyVd\nM60YIe8265XaEq1suMC5o1HyJFhOO7MUt3Jp+JAr2PFOYvWfTM+Oh7dAQ6tRVXZf\nlBvm/rEiSKlmFeXQOI4rwm3Vh09UA28g+4UhzSiuPq0cM4bLZDsyV/8ZSIjqReWO\nednE7XYkPX5KwE+HZCxdEh9oXqCM1c92CCP93qpFha0YOY1f+Ei34cjEoaYeSLyf\ng+salFz475OawramyvoydTqSWT25uEoqd7a2CtMqVQKBgQDR+/tFh/qN+6cO5iYP\nm6tBx0LkUpx55cimr8XqWkRl7xhOBCShEvr4TMhGOVEMwXmRCwm04T++Mi4k5CR8\noSwlGjPxZ6niJ7yDi1yfxNz73HuAtEL39zSMiF98PduYHEpd4j49FwK4TGWw8JvM\nPnlWrU9QVAENd3l24tgZoEe9SwKBgQDPx8IX4ZMDRODs57vpASDQDACRK9WRgumK\nNXsmt8xyPaRYqLLJebr8Kbh+vXK1aasYZRP3rmk8t7L0NH0gjH24zkeN0NADnpjM\nZ/zYz6oh6K/Cx0WalFX6RkB/MDl+XAKAWOsHHZ6Z3tbZgnAL8mxlVWim+Qke5kIa\nrcqo2F4i/QKBgGA+VD7cQlTNYRaNGijROr9dayVnT9z3Gu57ZgUx9mOaINOxRnCl\nWG5yEuFM5/8mtmdqXbqP+z1blpbGEosk/CzNQ72Du/OyLs9EEuIPwxGVTu4AsSki\nHu3Cm7FAUOP5I4TAa7JoV5DNQ1bEEUSd5dN6f/3bYtgfSIbbFh04v2jdAoGAIFqt\nqYRRnRezopAvHYg0cND9oZ1ewyrMbN4JEC1co4lftwKF3IOdDzj75phfbUpH/yN2\nKYI6Ft9P+WDW/yOBTC6qy7VxPq8KggHLSIOFrYQLIlxfRUPF45Pe5S9ANKHlLdEq\nv8/n63Pcpr/97I5SPLFA+4cZ2XrnXjojrYkLl40CgYAEY9i1GPDuqR0QdXeKYzMP\n1Xsp1SKxAwhg7WVw0RhCnma69M9eO5z/rBpfe1PH3PrJALANU4lFO7lsuZWqBLlx\nBz0DBku8hRLHpZlLFS/eT9JKfvqDvsY8ISxb8LvDZAbmU8NTQUpon+fw9FXg9ATs\ncQ9okr5ClffPn8osrEOyEw==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@campusconnect-c0c45.iam.gserviceaccount.com",
  client_id: "100038698581009250602",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40campusconnect-c0c45.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

module.exports = { firebaseConfig, serviceAccount };