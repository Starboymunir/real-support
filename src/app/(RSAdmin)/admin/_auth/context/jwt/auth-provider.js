'use client';

import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from '@/lib/utils/axios';
//
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
import jwt_decode from 'jwt-decode';
import { useSnackbar } from '@/app/(RSAdmin)/admin/common/snackbar';
import jwtDecode from 'jwt-decode';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { enqueueSnackbar } = useSnackbar();

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const user = jwtDecode(accessToken)

        dispatch({
          type: 'INITIAL',
          payload: {
            user,
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email, password) => {
    try {
      const data = {
        email,
        password,
      };
      const response = await axios.post(endpoints.admin.login, data);
      const { token } = response.data;

      setSession(token);
      var decodedUser = jwt_decode(token);
      dispatch({
        type: 'LOGIN',
        payload: {
          user: decodedUser,
        },
      });
    }
    catch (err) {
      enqueueSnackbar(err.message,{variant:"error"})
      console.log("Catch Error",err)
    }

  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    const data = {
      email,
      password,
      firstName,
      lastName,
    };

    const response = await axios.post(endpoints.auth.register, data);

    const { accessToken, user } = response.data;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    });
  }, []);

  // Change Password
  const changePassword = useCallback(
    async (email, oldPassword, confirmPassword) => {
      const data = {
        email,
        oldPassword,
        newPassword: confirmPassword,
      };
      try {
        const response = await axios.post(endpoints.admin.changePassword, data);

        if (response.status == 200) {
          enqueueSnackbar('Password Updated Successfully');
        }
      } catch (error) {
        console.log(error);
        if (error.status == 401) {
          enqueueSnackbar('Invalid Password', { type: 'error' });
        } else {
          enqueueSnackbar('Interval Server Problem Please Try Again Later!');
        }
      }
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
      changePassword,
    }),
    [login, logout, register, changePassword, state.user, status]
  );

  return (
    <>

      <AuthContext.Provider value={memoizedValue}>
        {children}
      </AuthContext.Provider>
    </>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
