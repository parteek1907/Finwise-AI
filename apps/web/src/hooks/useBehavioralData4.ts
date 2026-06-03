import { useState, useEffect } from 'react';
export function useBehavioralData4(init: boolean) {
  const [state, setState] = useState(init);
  useEffect(() => { const timer = setTimeout(()=>setState(!init), 1000); return ()=>clearTimeout(timer); }, [init]);
  return state;
}