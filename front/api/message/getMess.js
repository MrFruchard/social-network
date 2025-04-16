export async function getMessages(conversationId) {
  try {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    const response = await fetch(`https://api-sn.mtliche.com/api/messages?convID=${conversationId}`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}
