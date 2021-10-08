import React, {
    useRef
} from 'react';

const serialize = JSON.stringify,
    deserialize = JSON.parse;

// const expiryTime =  3 * 60 * 1000;

export function useLocalStorageState(key, initialState = {}) {
    const [state,
        setstate
    ] = React.useState(() => {
        // JSON.parse(window.localStorage.getItem(key)) || initialState)
        const valueInLocalStorage = window
            .localStorage
            .getItem(key);
        if (valueInLocalStorage) {
            return deserialize(valueInLocalStorage);
        }
        // in case it is an expensive function
        return typeof initialState === 'function' ? initialState() : initialState;
    });

    const prevKeyRef = useRef(key);

    React.useEffect(() => {
        const prevKey = prevKeyRef.current;

        let shouldSetLocalData = true;

        if (prevKey !== key) {
            window.localStorage.removeItem(prevKey);
        } else {
            /*if(state && state.setupTime){
              if(state.setupTime <= new Date().getTime()){
              // if((new Date().getTime()  )){
                shouldSetLocalData = false;
                window.localStorage.removeItem(key);
              }
            }*/
        }

        prevKeyRef.current = key;
        if (shouldSetLocalData) {
            window.localStorage.setItem(key, serialize(state));
        }
    }, [key, state]);

    return [state, setstate];
}

export function getLocalStorageKey(key) {
    let val = window.localStorage.getItem(key);
    if (val) {
        val = JSON.parse(val);
    }
    return val;
}