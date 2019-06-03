/* eslint-disable default-case */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import loggerMiddleware from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import axios from 'axios';

//CONSTANTS

const SET_USER = 'SET_USER';

//ACTION CREATORS

const setUser = user => ({
    type: SET_USER,
    user
});

//THUNKS

const loginAttempt = user => {
    return dispatch => {
        return axios
            .post('/api/auth', user)
            .then(response => response.data)
            .then(userData => {
                dispatch(setUser(userData));
                return true;
            });
    };
};

const syncCookieAndSession = () => {
    return dispatch => {
        return axios
            .get('/api/auth')
            .then(response => response.data)
            .then(data => {
                dispatch(setUser(data));
            })
    }
}

//REDUCERS

const user = (state = {}, action) => {
    switch (action.type) {
        case SET_USER:
            return action.user;
        default:
            return state;
    }
};

const reducer = combineReducers({
    user
});

const store = createStore(
    reducer,
    applyMiddleware(thunkMiddleware, loggerMiddleware)
);

export {
    store,
    loginAttempt,
    syncCookieAndSession
};
