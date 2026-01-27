export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pageId } = req.body

  if (!pageId) {
    return res.status(400).json({ error: 'Page ID is required' })
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,picture,link,story&limit=10&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    
    console.log('Fetching from Facebook API:', url.substring(0, 80) + '...')
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('Facebook API Response:', data)

    if (!data.data) {
      const errorMsg = data.error?.message || 'Unknown Facebook error'
      console.error('Facebook error:', errorMsg)
      return res.status(400).json({ error: 'Could not fetch posts', details: errorMsg })
    }

    // Format posts for your app
    const posts = data.data.map((post) => ({
      id: post.id,
      message: post.message || post.story || 'No description',
      createdTime: post.created_time,
      link: post.link,
      picture: post.picture,
    }))

    res.status(200).json({ posts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
