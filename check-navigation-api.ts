import axios from 'axios';

async function checkNavigationAPI() {
  try {
    // First login
    const loginResponse = await axios.post('http://localhost:5001/api/login', {
      email: 'admin@mssp.local',
      password: 'SecureTestPass123!'
    });

    const sessionCookie = loginResponse.headers['set-cookie']?.[0]?.split(';')[0];
    
    // Get accessible pages
    const pagesResponse = await axios.get('http://localhost:5001/api/user/accessible-pages', {
      headers: {
        'Cookie': sessionCookie,
        'Accept': 'application/json'
      }
    });

    console.log('Accessible Pages API Response:');
    console.log(JSON.stringify(pagesResponse.data, null, 2));
    
    // Check which URLs are returned
    console.log('\nPage URLs returned by API:');
    pagesResponse.data.forEach((page: any) => {
      console.log(`- ${page.pageUrl} (${page.displayName})`);
    });
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkNavigationAPI(); 