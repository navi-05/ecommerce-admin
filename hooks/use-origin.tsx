import { useEffect, useState } from "react"

/* 
  * This function will return the origin of the URL if and only
  ! when certain conditions are met.
  
  * mounted state with useEffect is used to handle hydration error, 
  * because nextjs is server-sided 
*/
export const useOrigin = () => {
  const [mounted, setMounted] = useState(false)
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted) return ''

  return origin;
}