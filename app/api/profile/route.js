import { getServerSession } from 'next-auth/next' 
import { authOptions } from '../auth/[...nextauth]/route' 

export async function GET(request) { 
  const session = await getServerSession(authOptions) 

  console.log('session', session) 
  
  return Response.json({ 
    message: 'test', 
    session
  }) 
} 
