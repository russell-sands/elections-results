import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import {
  electionReducer,
  initialElectionState,
  type ElectionState,
  type ElectionAction,
} from './election-reducer';
import { loadElectionData } from '../services/data-loader';
import { envConfig } from '../config/env';

const ElectionStateContext = createContext<ElectionState>(initialElectionState);
const ElectionDispatchContext = createContext<React.Dispatch<ElectionAction>>(() => {});

export function useElectionState() {
  return useContext(ElectionStateContext);
}

export function useElectionDispatch() {
  return useContext(ElectionDispatchContext);
}

export function ElectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(electionReducer, initialElectionState);

  useEffect(() => {
    if (!envConfig.boundariesLayerUrl || !envConfig.issuesRegistryTableUrl) {
      dispatch({
        type: 'LOAD_ERROR',
        payload: 'Missing required environment variables: VITE_BOUNDARIES_LAYER_URL and VITE_ISSUES_REGISTRY_TABLE_URL',
      });
      return;
    }

    dispatch({ type: 'LOAD_START' });

    loadElectionData(
      envConfig.boundariesLayerUrl,
      envConfig.issuesRegistryTableUrl,
    )
      .then((result) => {
        dispatch({ type: 'LOAD_SUCCESS', payload: result });
      })
      .catch((err) => {
        console.error('[elections-viewer] Data load failed:', err);
        dispatch({
          type: 'LOAD_ERROR',
          payload: err instanceof Error ? err.message : 'Failed to load election data',
        });
      });
  }, []);

  return (
    <ElectionStateContext.Provider value={state}>
      <ElectionDispatchContext.Provider value={dispatch}>
        {children}
      </ElectionDispatchContext.Provider>
    </ElectionStateContext.Provider>
  );
}
