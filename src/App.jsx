import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Capacitor } from '@capacitor/core';

import { db, auth } from './firebase.mjs'
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { signInWithCredential, signOut, GoogleAuthProvider, signInWithEmailAndPassword, onAuthStateChanged, deleteUser } from "firebase/auth";
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import SearchBar from './SearchBar';
import MenuSelect from './MenuSelect';
import FilterPage from './FilterPage';
import PropertyDetails from './PropertyDetails';
import FavoritesComponent from './FavoritesComponent';
import NewBuilding from './NewBuilding';
import Loading from './Loading';
import PropertiesPagination from './PropertiesPagination';
import RoleModal from './RoleModal';
import ProfilePage from './ProfilePage';
import MyProperties from './MyProperties';
import AdminPanel from './AdminPanel';
import Toast from './Toast';
import './App.css';

const isNative = Capacitor.isNativePlatform();

function PendingNavigator({ pendingNav, onDone }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (pendingNav) {
      navigate(pendingNav);
      onDone();
    }
  }, [pendingNav]);
  return null;
}

function App() {
  const defaultConditions = {
    searchTerm: '',
    bedOptions: 'All',
    orderBy: 'All',
    amenities: [],
    rentRange: [1000, 30000],
    bathroomType: 'Any',
  };

  const [filteredProperties, setFilteredProperties] = useState([]);
  const [conditions, setConditions] = useState(defaultConditions);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingNav, setPendingNav] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  // ─── Persist auth on refresh ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        const userData = docSnap.exists() ? docSnap.data() : {};
        setUser({
          ...firebaseUser,
          role: userData.role || null,
          name: userData.name || firebaseUser.displayName,
          profilePicture: userData.profilePicture || firebaseUser.photoURL,
          isAdmin: userData.isAdmin === true,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ─── Fetch properties — wait for auth to resolve first (critical on Android/Capacitor)
  useEffect(() => {
    if (!authLoading) fetchAndListen();
  }, [authLoading]);

  const fetchAndListen = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'properties'), where('status', '==', 'approved'));
      const querySnapshot = await getDocs(q);
      const properties = [];
      querySnapshot.forEach((doc) => {
        properties.push({ id: doc.id, ...doc.data() });
      });
      setFilteredProperties(properties.filter(p => p.id && p.name));
    } catch (error) {
      console.error('Error fetching properties:', error);
      showToast('Failed to load properties. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Search / filter ──────────────────────────────────────────────────────────
  const handleSearch = (conditions) => {
    let orderByField = null;
    let searchTermTarget = null;
    let amenitiesTarget = null;
    let rentRangeTarget = null;
    let bedOptionsTarget = null;

    setConditions(conditions);

    getDocs(query(collection(db, "properties"), where('status', '==', 'approved'))).then((querySnapshot) => {
      let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const [key, value] of Object.entries(conditions)) {
        if (key === "searchTerm" && value) {
          searchTermTarget = value.trim().toLowerCase();
        } else if (key === "orderBy" && value && value !== 'All') {
          orderByField = value;
        } else if (key === "bedOptions" && value && value !== 'All') {
          bedOptionsTarget = value;
        } else if (key === "amenities" && Array.isArray(value) && value.length > 0) {
          amenitiesTarget = value;
        } else if (key === "rentRange" && value) {
          rentRangeTarget = value;
        }
      }

      if (searchTermTarget) {
        results = results.filter(p => p.name.toLowerCase().includes(searchTermTarget));
      }
      if (bedOptionsTarget) {
        results = results.filter(p => p.bedOptions?.includes(bedOptionsTarget));
      }
      if (amenitiesTarget) {
        results = results.filter(p =>
          amenitiesTarget.every(amenity => p.amenities?.includes(amenity))
        );
      }
      if (rentRangeTarget) {
        const [min, max] = rentRangeTarget;
        results = results.filter(p => p.price >= min && p.price <= max);
      }
      if (conditions.bathroomType && conditions.bathroomType !== 'Any') {
        results = results.filter(p => p.amenities?.includes(conditions.bathroomType));
      }
      if (orderByField) {
        results = [...results].sort((a, b) =>
          orderByField === 'rating'
            ? (b.rating || 0) - (a.rating || 0)
            : (b.numberOfReviews || 0) - (a.numberOfReviews || 0)
        );
      }

      setFilteredProperties(results);
    });
  };

  // ─── New property ─────────────────────────────────────────────────────────────
  const handleNewProperty = async (newProperty) => {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    const propertyRef = doc(db, 'properties', id);
    await setDoc(propertyRef, {
      ...newProperty,
      landlordId: user?.uid || null,
      status: 'pending',
      submittedAt: Date.now(),
    });
    return true;
  };

  // ─── Sign in ──────────────────────────────────────────────────────────────────
  const handleSignIn = async (method = 'google', roleSelection = null, email = null, password = null) => {
    if (method === 'google') {
      try {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);
        const userCredential = await signInWithCredential(auth, credential);

        const userRef = doc(db, "users", userCredential.user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            name: userCredential.user.displayName,
            profilePicture: userCredential.user.photoURL,
            favorites: [],
            role: roleSelection,
          });
          setUser({ ...userCredential.user, role: roleSelection, profilePicture: userCredential.user.photoURL });
        } else {
          const userData = docSnap.data();
          const isAdmin = userData.isAdmin === true;
          // Never overwrite an admin's role with roleSelection from the modal
          const finalRole = isAdmin ? userData.role : (userData.role || roleSelection);
          if (!userData.role && roleSelection && !isAdmin) {
            await setDoc(userRef, { role: roleSelection }, { merge: true });
          }
          setUser({
            ...userCredential.user,
            role: finalRole,
            name: userData.name || userCredential.user.displayName,
            profilePicture: userData.profilePicture || userCredential.user.photoURL,
            isAdmin,
          });
        }
        setShowRoleModal(false);
        const nav = sessionStorage.getItem('postSignInNav');
        if (nav) { sessionStorage.removeItem('postSignInNav'); setPendingNav(nav); }
      } catch (err) {
        console.error('Google sign-in error:', err);
        showToast('Google sign-in failed. Please try again.');
      }

    } else if (method === 'email') {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", result.user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            name: result.user.email,
            profilePicture: null,
            favorites: [],
            role: roleSelection,
          });
          setUser({ ...result.user, role: roleSelection, profilePicture: null });
        } else {
          const userData = docSnap.data();
          const storedRole = userData.role;
          setUser({
            ...result.user,
            role: storedRole,
            name: userData.name || result.user.email,
            profilePicture: userData.profilePicture || null,
            isAdmin: userData.isAdmin === true,
          });
          if (storedRole && storedRole !== roleSelection) {
            setShowRoleModal(false);
            const nav = sessionStorage.getItem('postSignInNav');
            if (nav) { sessionStorage.removeItem('postSignInNav'); setPendingNav(nav); }
            return storedRole;
          }
        }
        setShowRoleModal(false);
        const nav = sessionStorage.getItem('postSignInNav');
        if (nav) { sessionStorage.removeItem('postSignInNav'); setPendingNav(nav); }
      } catch (err) {
        console.error('Email sign-in error:', err);
        const message =
          err.code === 'auth/invalid-credential' ? 'Incorrect email or password.' :
          err.code === 'auth/user-not-found'     ? 'No account found with that email.' :
          err.code === 'auth/wrong-password'     ? 'Incorrect password.' :
          err.code === 'auth/too-many-requests'  ? 'Too many attempts. Please try again later.' :
          'Sign-in failed. Please try again.';
        showToast(message);
      }
    }
  };

  // ─── Update profile ───────────────────────────────────────────────────────────
  const handleUpdateProfile = async (updates) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, updates, { merge: true });
    setUser(prev => ({ ...prev, ...updates }));
  };

  // ─── Delete account ───────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);
      setUser(null);
    } catch (err) {
      console.error('Error deleting account:', err);
      if (err.code === 'auth/requires-recent-login') {
        await signOut(auth);
        setUser(null);
        showToast('For security, please sign in again and then delete your account.');
      } else {
        showToast('Failed to delete account. Please try again.');
      }
    }
  };

  // ─── Sign out ─────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setConditions(defaultConditions);
    fetchAndListen();
  };

  if (authLoading && !isNative) return <Loading />;

  return (
    <Router>
      <PendingNavigator pendingNav={pendingNav} onDone={() => setPendingNav(null)} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showRoleModal && (
        <RoleModal
          key={Date.now()}
          onSignIn={handleSignIn}
          onClose={() => setShowRoleModal(false)}
        />
      )}
      <Routes>
        <Route path="/" element={
          <div className="App">
            <div className="search-bar">
              <SearchBar
                onSearch={handleSearch}
                user={user}
                handleSignIn={() => setShowRoleModal(true)}
                handleSignOut={handleSignOut}
                conditions={conditions}
              />
            </div>
           {loading && !isNative ? <Loading /> : (
  <div>
    {loading || filteredProperties.length > 0
      ? <PropertiesPagination properties={filteredProperties} user={user} handleSignIn={() => setShowRoleModal(true)} />
      : <h1 className="no-properties">No properties found</h1>
    }
  </div>
)}
            <div className="menu-container">
              <MenuSelect user={user} />
            </div>
          </div>
        } />
        <Route path="/filter" element={<FilterPage conditions={conditions} onSearch={handleSearch} />} />
        <Route path="/property/:id" element={
          <PropertyDetails
            user={user}
            handleSignIn={() => setShowRoleModal(true)}
            handleSignOut={handleSignOut}
            handleSearch={() => handleSearch(conditions)}
            showToast={showToast}
          />
        } />
        <Route path="/add" element={<NewBuilding handleNewProperty={handleNewProperty} showToast={showToast} user={user} />} />
        <Route path="/favorites" element={
          <FavoritesComponent
            user={user}
            handleSearch={handleSearch}
            handleSignIn={() => setShowRoleModal(true)}
            handleSignOut={handleSignOut}
            showToast={showToast}
          />
        } />
        <Route path="/my-properties" element={
          <MyProperties user={user} handleSignIn={() => setShowRoleModal(true)} showToast={showToast} />
        } />
        <Route path="/admin" element={
          authLoading
            ? (isNative ? null : <Loading />)
            : user?.isAdmin === true
              ? <AdminPanel user={user} />
              : <Navigate to="/" replace />
        } />
        <Route path="/profile" element={
          <ProfilePage
            user={user}
            handleSignIn={() => setShowRoleModal(true)}
            handleSignOut={handleSignOut}
            handleUpdateProfile={handleUpdateProfile}
            handleDeleteAccount={handleDeleteAccount}
            showToast={showToast}
          />
        } />
      </Routes>
    </Router>
  );
}

export default App;