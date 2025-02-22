import UserContext from '../contexts/UserContext';
import { useState, useEffect, useContext, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import axios from 'axios';
import { auth } from '../firebase';

function useUserState() {
  const [userState, setUserState] = useState({
    isLoggedIn: !!localStorage.getItem('aplikacjaInwentarza.isLoggedIn'),
    user: null,
  });

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult(true);
        setUserState({
          isLoggedIn: true,
          user: {
            uid: user.uid,
            displayName: user.displayName,
            email: idTokenResult.claims.email,
            admin: idTokenResult.claims.role === 'admin',
            createdAt: new Date(user.metadata.creationTime),
          },
        });
        localStorage.setItem('aplikacjaInwentarza.isLoggedIn', true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
      } else {
        setUserState({
          isLoggedIn: false,
          user: null,
        });
      }
    });
  }, []);

  const signUp = useCallback(
    ({ email, password }) =>
      createUserWithEmailAndPassword(auth, email, password).then(
        async (userCredential) => {
          const user = userCredential.user;
          const idToken = await user.getIdToken();
          const idTokenResult = await user.getIdTokenResult(true);
          setUserState({
            isLoggedIn: true,
            user: {
              uid: user.uid,
              displayName: user.displayName,
              email: idTokenResult.claims.email,
              admin: idTokenResult.claims.role === 'admin',
              createdAt: new Date(user.metadata.creationTime),
            },
          });
          localStorage.setItem('aplikacjaInwentarza.isLoggedIn', true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
        }
      ),
    []
  );

  const signIn = useCallback(
    ({ email, password }) =>
      signInWithEmailAndPassword(auth, email, password).then(
        async (userCredential) => {
          const user = userCredential.user;
          const idToken = await user.getIdToken();
          const idTokenResult = await user.getIdTokenResult(true);
          setUserState({
            isLoggedIn: true,
            user: {
              uid: user.uid,
              displayName: user.displayName,
              email: idTokenResult.claims.email,
              admin: idTokenResult.claims.role === 'admin',
              createdAt: new Date(user.metadata.creationTime),
            },
          });
          localStorage.setItem('aplikacjaInwentarza.isLoggedIn', true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
        }
      ),
    []
  );

  const signOut = useCallback(
    () =>
      firebaseSignOut(auth).then(() => {
        setUserState({
          isLoggedIn: false,
          user: null,
        });
        localStorage.removeItem('aplikacjaInwentarza.isLoggedIn');
        delete axios.defaults.headers.common['Authorization'];
      }),
    []
  );

  return {
    userState,
    setUserState,
    signUp,
    signIn,
    signOut,
  };
}

export function UserStateProvider({ children }) {
  const userState = useUserState();

  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  );
}

export function UserStateConsumer() {
  return useContext(UserContext);
}
