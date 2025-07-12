import { createSignal, createEffect, onMount } from 'solid-js'

type Theme = 'light' | 'dark' | 'system'

export function useDarkMode() {
  const [theme, setTheme] = createSignal<Theme>('system')
  const [isDark, setIsDark] = createSignal(false)

  // Get saved theme from localStorage or default to system
  const getStoredTheme = (): Theme => {
    const stored = localStorage.getItem('theme') as Theme
    return stored || 'system'
  }

  // Save theme to localStorage
  const saveTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
  }

  // Check system preference
  const getSystemPreference = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Apply dark mode to document
  const applyDarkMode = (dark: boolean) => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
    setIsDark(dark)
  }

  // Update dark mode based on current theme
  const updateDarkMode = () => {
    const currentTheme = theme()
    let shouldBeDark = false

    if (currentTheme === 'dark') {
      shouldBeDark = true
    } else if (currentTheme === 'light') {
      shouldBeDark = false
    } else {
      shouldBeDark = getSystemPreference()
    }

    applyDarkMode(shouldBeDark)
  }

  // Toggle between light and dark (not system)
  const toggle = () => {
    const newTheme = isDark() ? 'light' : 'dark'
    saveTheme(newTheme)
  }

  // Set specific theme
  const setMode = (newTheme: Theme) => {
    saveTheme(newTheme)
  }

  onMount(() => {
    // Initialize theme from storage
    const storedTheme = getStoredTheme()
    setTheme(storedTheme)
    
    // Apply initial dark mode immediately to prevent flash
    updateDarkMode()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      if (theme() === 'system') {
        updateDarkMode()
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange)
    }
  })

  // React to theme changes
  createEffect(() => {
    updateDarkMode()
  })

  return {
    theme,
    isDark,
    toggle,
    setMode
  }
}