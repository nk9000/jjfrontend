import React, { useState } from 'react';
import * as XLSX from 'xlsx';


function TextAreaComponent() {
  const [text, setText] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newEntries = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    setText('');
    setLoading(true);

    try {
      const res = await fetch('https://jj-1-1ws4.onrender.com/x', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ abc: newEntries })
      });

      const result = await res.json();
      setResponse(result);
      exportToExcel(result); // Call function to export to Excel
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Failed to fetch data from the server' });
    } finally {
      setLoading(false);
    }
  };

  const extractCompanyName = (url) => {
    const query = new URL(url).searchParams.get('q');
    return query.split('+')[0];
  };

  const exportToExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      [extractCompanyName(item.url)]: item.followersCount || 'Cannot extract'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'response.xlsx');
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={handleInputChange}
          placeholder="Enter or paste names separated by new lines as www.companyname.com"
        />
        <button type="submit">Submit</button>
      </form>
      <div className="message">
        Please note: Processing time increases with the size of the input.
      </div>
      {loading && <div className="loader"></div>}
      {response && !loading && (
        <div>
          <h3>Response from server:</h3>
          <ul>
            {response.map((item, index) => (
              <li key={index}>
                {extractCompanyName(item.url)}'s followers: {item.followersCount || 'Cannot extract'}
              </li>
            ))}
          </ul>
          <a href="response.xlsx" download>Download Excel</a>
        </div>
      )}
      {response?.error && <div>Error: {response.error}</div>}
    </div>
  );
}

export default TextAreaComponent;
