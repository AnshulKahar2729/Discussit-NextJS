import React from 'react'

interface PostPageProps {
    params: { postId: string }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const PostPage = ({ params }: PostPageProps) => {
    return (
        <div>

        </div>
    )
}

export default PostPage;