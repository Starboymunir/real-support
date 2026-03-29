// components/UserProvider.js
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';
import { IUser } from '@/types/type';
import { jwtDecode } from 'jwt-decode';

type UserContextType = {
  user: IUser | null;
  userId: string | null;
};
// Create a Context for the user ID
export const UserContext = createContext<UserContextType>({
  user: null,
  userId: null,
});

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser | null>(null);
  const userId = useMemo(() => user?.id || null, [user]);

  useEffect(() => {
    // Function to fetch the current authenticated user
    const fetchUserId = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const { data } = await axios.get(`/api/users/info/${user.userId}`);
          const decodedUser: IUser = jwtDecode(data);
          // Set the user ID (you can adjust this based on how your user object is structured)
          setUser(decodedUser);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setUser(null);
      }
    };

    fetchUserId();
  }, []);

  return <UserContext.Provider value={{ user, userId }}>{children}</UserContext.Provider>;
};
