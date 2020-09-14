# Redux-Thunk

```js
function createThunkMiddleware(extraArgument) {
    return function ({ dispatch, getState }) {
        return function (next) {
            return fucntion (action) {
                if (typeof action === 'function') {
                    return action(dispatch, getState, extraArgument);
                }

                return next(action);
            }
        }
    }
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```
