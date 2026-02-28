const initialState = {
    userInfo: null,
    isUpdating: false,
    updateError: null,
    updateSuccess: false,
};

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'USER_UPDATE_REQUEST':
            return { ...state, isUpdating: true, updateError: null };
        case 'USER_UPDATE_SUCCESS':
            return {
                ...state,
                isUpdating: false,
                updateSuccess: true,
                userInfo: action.payload,
            };
        case 'USER_UPDATE_FAIL':
            return {
                ...state,
                isUpdating: false,
                updateError: action.payload,
            };
        default:
            return state;
    }
};
