export async function getConversations() {
  try {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    const response = await fetch('/api/conversation', requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}
