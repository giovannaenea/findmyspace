import React, { useState, useEffect } from 'react';

const BookmarkFilled = () => (
  <svg viewBox="0 0 14 14" fill="#033F63" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 13.5L7 9.5L3 13.5V1.5C3 1.23478 3.10536 0.98043 3.29289 0.792893C3.48043 0.605357 3.73478 0.5 4 0.5H10C10.2652 0.5 10.5196 0.605357 10.7071 0.792893C10.8946 0.98043 11 1.23478 11 1.5V13.5Z" />
  </svg>
);

const BookmarkEmpty = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 13.5L7 9.5L3 13.5V1.5C3 1.23478 3.10536 0.98043 3.29289 0.792893C3.48043 0.605357 3.73478 0.5 4 0.5H10C10.2652 0.5 10.5196 0.605357 10.7071 0.792893C10.8946 0.98043 11 1.23478 11 1.5V13.5Z" />
  </svg>
);

import { db } from './firebase'
import { doc, setDoc, getDoc } from "firebase/firestore";

const Favorite = ({ userId, propertyId }) => {
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        const checkIfFavorited = async () => {
            if (!userId) return false;
            const userRef = doc(db, "users", userId);
            const docSnap = await getDoc(userRef);
            
            return docSnap.exists() && docSnap.data().favorites && docSnap.data().favorites.includes(propertyId);
        };

        checkIfFavorited().then(favorited => {
            setIsFavorited(favorited)
        });
    }, [userId, propertyId]);

    const handleFavoriteClick = async () => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        const favorites = docSnap.data().favorites;
      
        if (!isFavorited) {
            // add to favorites
            await setDoc(userRef, { favorites: [...favorites, propertyId] }, { merge: true });
            setIsFavorited(true);
        } else {
            // remove from favorites
            await setDoc(userRef, { favorites: favorites.filter(id => id != propertyId) }, { merge: true });
            setIsFavorited(false);
        }
      };

    return (
        <div className="favorite-icon" onClick={handleFavoriteClick}>
            {isFavorited ? <BookmarkFilled /> : <BookmarkEmpty />}
        </div>
    );
};

export default Favorite;