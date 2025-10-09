import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Review Collector. All rights reserved.
        </p>
        <p className="mb-0">
          Built with ❤️ by Yogendra
        </p>
      </div>
    </footer>
  )
}

export default Footer
