"use client"
import "./style.scss"
import { useState, useEffect } from 'react'
import { BASE_URL } from '@/store'
import CreatePostModal from "./components/CreatePostModal"

function Posts() {
    const [showModal, setShowModal] = useState(false)
    const [posts, setPosts] = useState([])

    async function getPosts() {
        const response = await fetch(BASE_URL + "/api/posts/")
        const data = await response.json()
        setPosts(data.data)
    }
    async function deletePost(postID) {
        if(!confirm("Are you sure you want to delete this post?")){
            return
        }
        const response = await fetch(BASE_URL + "/api/posts/" + postID, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        console.log(data);
        getPosts()
    }
    async function editPost(post) {
        const newTitle = prompt('New title', post.title)
        if (newTitle === null) return
        const newContent = prompt('New content', post.content)
        if (newContent === null) return

        const response = await fetch(BASE_URL + "/api/posts/" + post.id, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle, content: newContent })
        })
        const data = await response.json()
        console.log(data);
        getPosts()
    }
    useEffect(() => {
        getPosts()
    }, [])

    return (
        <div className="posts-page-wrapper">
            <h1>Posts</h1>

            <button onClick={() => setShowModal(true)}>
                Create new post
            </button>

            {
                showModal && 
                <CreatePostModal closeModal={() => setShowModal(false)} getPosts={getPosts}/>
            }
            <div className="posts-cards">
                            {
                posts.map((post, idx) => {
                    return(
                        <div className="post-card" key={post.id ?? idx}>
                            <h2>{post.title}</h2>
                            <p>{post.content}</p>
                            <button className="delete-post-button" 
                            
                            onClick={() => deletePost(post.id)}>
                                Delete
                            </button>
                            <button className="update-post-button"
                            onClick={() => editPost(post)}
                            >
                                Edit
                            </button>
                        </div>
                    )
                })
            }
            </div>
        </div>
    );
}

export default Posts;