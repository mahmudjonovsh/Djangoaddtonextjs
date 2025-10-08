"use client"
import "./style.scss"
import { useEffect, useState } from "react";
import {BASE_URL} from '@/store'

export default function About() {
    const [posts, setPosts] = useState([])
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    async function getPosts() {
        try {
            const response = await fetch(BASE_URL + "api/posts/");
            const data = await response.json();
            if (data?.data) setPosts(data.data)
        } catch (err) {
            console.error("Fetch posts error:", err)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const res = await fetch(BASE_URL + "api/posts/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, content }),
            })
            if (res.ok) {
                setTitle("")
                setContent("")
                getPosts()
            } else {
                const err = await res.json()
                console.error("Create post error:", err)
            }
        } catch (err) {
            console.error("Network error when creating post:", err)
        }
    }

    useEffect(() => {
        getPosts()
    }, [])

    return (
        <div className="about-page-wrapper">
            <h1>About</h1>
            <p>Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты.</p>

            <div className="content-grid">
                <form onSubmit={handleSubmit} className="post-form" aria-label="Create post">
                    <div>
                        <label>Title</label>
                        <input value={title} onChange={(e)=>setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label>Content</label>
                        <textarea value={content} onChange={(e)=>setContent(e.target.value)} required />
                    </div>
                    <button type="submit">Create Post</button>
                </form>

                <section className="posts-list" aria-live="polite">
                    <h2>Posts</h2>
                    {posts.length === 0 && <p>No posts yet.</p>}
                    <ul>
                        {posts.map(p => (
                            <li key={p.id}>
                                <h3>{p.title}</h3>
                                <p>{p.content}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    )
}