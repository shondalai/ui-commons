import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, LogIn, X } from 'lucide-react'
import { Button } from './button'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  labels?: {
    title?: string
    subtitle?: string
    username?: string
    usernamePlaceholder?: string
    password?: string
    passwordPlaceholder?: string
    rememberMe?: string
    forgotPassword?: string
    login?: string
    loggingIn?: string
    noAccount?: string
    register?: string
  }
  urls?: {
    forgotPassword?: string
    register?: string
  }
  returnUrl?: string
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  labels = {},
  urls = {},
  returnUrl,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const defaultLabels = {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    login: 'Login',
    loggingIn: 'Logging in...',
    noAccount: 'Don\'t have an account?',
    register: 'Register',
  }

  const finalLabels = { ...defaultLabels, ...labels }

  const defaultUrls = {
    forgotPassword: '/index.php?option=com_users&view=reset',
    register: '/index.php?option=com_users&view=registration',
  }

  const finalUrls = { ...defaultUrls, ...urls }

  if (!isOpen) {
    return null
  }

  // Get CSRF token from Joomla
  const getCSRFToken = () => {
    const joomlaOptions = (window as any).Joomla?.getOptions?.('csrf.token')
    if (typeof joomlaOptions === 'string') {
      return joomlaOptions
    }
    return Object.keys(joomlaOptions || {})[0] || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const form = e.target as HTMLFormElement
    form.submit()
  }

  const finalReturnUrl = returnUrl || window.location.href

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-950 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <LogIn className="h-5 w-5 text-white" strokeWidth={2.5}/>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {finalLabels.title}
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {finalLabels.subtitle}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5"/>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-6" method="POST" action="/index.php">
            <input type="hidden" name="option" value="com_users"/>
            <input type="hidden" name="task" value="user.login"/>
            <input type="hidden" name="return" value={btoa(finalReturnUrl)}/>
            {getCSRFToken() && <input type="hidden" name={getCSRFToken()} value="1"/>}

            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  {finalLabels.username}
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={finalLabels.usernamePlaceholder}
                  className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  {finalLabels.password}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={finalLabels.passwordPlaceholder}
                    className="w-full h-10 px-3 pr-10 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="remember"
                    value="yes"
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500 dark:focus:ring-blue-600 flex-shrink-0 cursor-pointer"
                    defaultChecked
                  />
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                    {finalLabels.rememberMe}
                  </span>
                </label>
                <a
                  href={finalUrls.forgotPassword}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {finalLabels.forgotPassword}
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-6 h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                  {finalLabels.loggingIn}
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2"/>
                  {finalLabels.login}
                </>
              )}
            </Button>

            {/* Register Link */}
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {finalLabels.noAccount}{' '}
              </span>
              <a
                href={finalUrls.register}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                {finalLabels.register}
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default LoginModal
