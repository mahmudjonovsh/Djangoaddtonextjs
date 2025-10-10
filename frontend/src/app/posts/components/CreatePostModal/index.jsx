"use client"
import { BASE_URL } from "@/store"
import "./style.scss"
import { useState } from 'react'


function CreatePostModal({ closeModal,getPosts }) {
    const [form, setForm] = useState({
        title: '',
        content: ''
    })

    async function handleSubmit(e) {
        e.preventDefault()
        
        try {
            const response = await fetch(BASE_URL + "/api/posts/", {
                method: "POST",
                body: JSON.stringify(form),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await response.json()
            console.log(data)
            alert('Post created successfully')
            closeModal()
            await getPosts()
        } catch (e) {
            console.log(e)
            alert('Error creating post')
        }
    }
    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="post-form-modal">
            <form className="create-post-form-wrapper"
                onSubmit={handleSubmit}
            >
                <span onClick={closeModal} id='close-modal-button'>&times;</span>
                <div className="form-control">
                    <label htmlFor="post-title-input">Title</label>
                    <input
                        type="text"
                        id='post-title-input'
                        name='title'
                        placeholder='Title'
                        value={form.title}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="post-title-content">Content</label>
                    <textarea
                        id='post-title-content'
                        name='content'
                        placeholder='content'
                        value={form.content}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <button type="submit">Create Post</button>
            </form>
        </div>
    )
}

export default CreatePostModal