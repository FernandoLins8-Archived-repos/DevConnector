import React, { ChangeEvent, FormEvent, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  })

  const { name, email, password, password2 } = formData

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()

    if(password !== password2) {
      alert('Passwords do not match')
      setFormData({
        ...formData,
        password: '',
        password2: ''
      })
    } else {
      const newUser = {
        name,
        email,
        password
      }

      try {
        await axios.post('/api/users', newUser, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        alert('User Created')
        setFormData({
          name: '',
          email: '',
          password: '',
          password2: ''
        })

      } catch(err) {
        console.error(err.message)
      }
    }
  }
  
  return (
    <>
      <h1 className="large text-primary">
        Sign Up
      </h1>
      <p className="lead">
        <i className="fas fa-user"></i> 
        Create Your Account
      </p>
      <form className="form" onSubmit={handleFormSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            name="name"
            placeholder="Name" 
            required 
            value={name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <input 
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleInputChange}
          />
          <small className="form-text">
            This site uses Gravatar, so if you want a profile image, use a Gravatar email
          </small>
        </div>
        <div className="form-group">
          <input 
            type="password"
            name="password"
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <input 
            type="password"
            name="password2"
            minLength={6}
            placeholder="Confirm Password"
            value={password2}
            onChange={handleInputChange}
          />
        </div>
        <input type="submit" value="Register" className="btn btn-primary" />
      </form>
      <p className="my-1">Already have an account? <Link to="/login">Sign In</Link></p>
    </>
  )
}

export default Register
