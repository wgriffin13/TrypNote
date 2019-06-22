/* eslint-disable default-case */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import loggerMiddleware from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import axios from 'axios';

//CONSTANTS

const SET_USER = 'SET_USER';
const SET_LOCATION = 'SET_LOCATION';
const SET_WEATHER = 'SET_WEATHER';

//ACTION CREATORS

const setUser = user => ({
    type: SET_USER,
    user
});

const setLocation = location => ({
    type: SET_LOCATION,
    location
});

const setWeather = weather => ({
    type: SET_WEATHER,
    weather
})

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

const logoutAttempt = () => {
    return dispatch => {
        return axios
            .delete('/api/auth')
            .then(response => {
                if (response.status === 204) {
                    dispatch(setUser({}));
                    dispatch(setLocation({}));
                    dispatch(setWeather({}));
                    return true;
                } else {
                    const error = new Error('Could not log out');
                    error.status = 401;
                    throw error;
                }
            })
            .catch(error => console.log(error));
    }
}

const weatherApiCall = location => {
    return dispatch => {
        return axios
            .post('/api/weathers/weatheratlocation', location)
            .then(response => response.data)
            .then(data => {
                dispatch(setWeather(data));
            })
            .catch(error => console.log(error));
    }
};

const locationCall = ip => {
    return dispatch => {
        return axios
            .post('/api/locations/currentlocation', ip)
                .then(response => response.data)
                .then(location => {
                    dispatch(setLocation(location));
                    dispatch(weatherApiCall(location));
                })
    }
}

const ipLocationCall = () => {
    return dispatch => {
        return axios
            .get('https://api.ipify.org?format=json')
            .then(response => response.data)
            .then(data => {
                dispatch(locationCall(data))
            })
            .catch(error => console.log(error));
    };
};

const syncCookieAndSession = () => {
    return dispatch => {
        return axios
            .get('/api/auth')
            .then(response => response.data)
            .then(data => {
                dispatch(setUser(data));
                dispatch(ipLocationCall());
            })
            .catch(error => console.log(error));
    };
};

const createUser = user => {
    return dispatch => {
        return axios
            .post('/api/users', user)
            .then(response => response.data)
            .then(data => {
                dispatch(loginAttempt(data))
                dispatch(ipLocationCall())
                return true
            })
            .catch(error => console.log(error));
    };
};

//REDUCERS

const user = (state = {}, action) => {
    switch (action.type) {
        case SET_USER:
            return action.user;
        default:
            return state;
    }
};

const location = (state = {}, action) => {
    switch (action.type) {
        case SET_LOCATION:
            return action.location;
        default:
            return state;
    }
};

const weather = (state = {}, action) => {
    switch (action.type) {
        case SET_WEATHER:
            return action.weather;
        default:
            return state;
    }
};

const reducer = combineReducers({
    user,
    location,
    weather
});

const store = createStore(
    reducer,
    applyMiddleware(thunkMiddleware, loggerMiddleware)
);

export {
    store,
    loginAttempt,
    syncCookieAndSession,
    createUser,
    ipLocationCall,
    weatherApiCall,
    logoutAttempt
};
