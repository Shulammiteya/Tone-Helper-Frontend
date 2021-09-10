import { types } from './actions';
  
  const initialState = {
    semiFinishedData: [],
    selectedData: [],
    finishedData: [],
  };
  
  function dataReducer(state = initialState, action) {
    switch (action.type) {
      case types.ADD_SEMI_FINISHED_DATA:
        return {
          ...state,
          semiFinishedData: [...state.semiFinishedData, action.payload]
        };
      case types.REMOVE_SEMI_FINISHED_DATA:
        return {
          ...state,
          semiFinishedData: state.semiFinishedData.filter(data => {
            for (let i = 0; i < action.dataArr.length; i++)
              if (data.id === action.dataArr[i].id)
                return false;
            return true;
          }),
          selectedData: []
        };
      case types.ADD_SELECTED_DATA:
        return {
          ...state,
          selectedData: [...state.selectedData, action.payload]
        };
      case types.REMOVE_SELECTED_DATA:
        return {
          ...state,
          selectedData: state.selectedData.filter(data => data.id !== action.payload.id)
        };
      case types.SELECT_ALL:
        return {
          ...state,
          selectedData: state.semiFinishedData
        };
      case types.UNSELECT_ALL:
        return {
          ...state,
          selectedData: []
        };
      case types.ADD_FINISHED_DATA:
        return {
          ...state,
          finishedData: [...state.finishedData, action.payload]
        };
      case types.REMOVE_FINISHED_DATA:
        return {
          ...state,
          finishedData: state.finishedData.filter(data => data.id !== action.payload.id)
        };
      default:
        return state;
    }
  }
  
  export default dataReducer;