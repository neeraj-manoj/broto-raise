'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ScrollToHash() {
  const router = useRouter()

  useEffect(() => {
    // Check if there's a hash in the URL
    if (window.location.hash === '#complaints-section') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById('complaints-section')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [])

  return null
}
