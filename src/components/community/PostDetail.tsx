import { useState, useEffect } from 'react';
import { forumService } from '@/services/forumService';

interface Comment {
    _id: string;
    user: { _id: string, username: string };
    content: string;
    createdAt: string;
    isAnonymous: boolean;
}

interface PostDetailProps {
    postId: string;
    onBack: () => void;
}

export const PostDetail = ({ postId, onBack }: PostDetailProps) => {
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchPostData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const [postRes, commentsRes] = await Promise.all([
                forumService.getPost(token, postId),
                forumService.getComments(token, postId)
            ]);

            setPost(postRes.data);
            setComments(commentsRes.data);
        } catch (err) {
            console.error('Failed to load post details', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostData();
    }, [postId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await forumService.addComment(token, postId, newComment, isAnonymous);
            setNewComment('');
            setIsAnonymous(false);
            fetchPostData(); // Refresh to see new comment
        } catch (err) {
            console.error('Failed to post comment', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!post) return <div className="text-center py-10">Post not found</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in-up">
            <button
                onClick={onBack}
                className="text-primary-600 hover:text-primary-700 m-4 flex items-center font-medium"
            >
                ← Back to Feed
            </button>

            {/* Main Post */}
            <div className="px-6 pb-6 border-b">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.content}</h1>

                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${post.topic === 'anxiety' ? 'bg-red-100 text-red-800' :
                            post.topic === 'depression' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {post.topic}
                    </span>
                    <span>• Posted by {post.isAnonymous ? 'Anonymous' : post.user?.username}</span>
                    <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-4 text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-primary-600">
                        <span>❤️</span>
                        <span>{post.likesCount} Likes</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-600 ml-auto text-sm">
                        <span>🚩 Report</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Comments ({comments.length})</h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-400"
                        rows={3}
                        placeholder="Add to the discussion..."
                        required
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="comment-anon"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="comment-anon" className="ml-2 text-sm text-gray-600">Post anonymously</label>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>

                {/* Comment List */}
                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No comments yet. Be the first to share your thoughts.</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${comment.isAnonymous ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {comment.isAnonymous ? '?' : comment.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {comment.isAnonymous ? 'Anonymous' : comment.user.username}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-800 text-sm ml-8">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
