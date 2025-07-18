import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Journaling.css';
import Navigation from '../components/Navigation';

const Journaling = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/journals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJournalEntries(response.data);
    } catch (error) {
      setMessage('Failed to fetch journal entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/journals', { 
        content: newEntry,
        date: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setJournalEntries([response.data, ...journalEntries]);
      setNewEntry('');
      setShowNewEntryForm(false);
      
      // Show XP reward message
      const { xpReward } = response.data;
      if (xpReward) {
        const rewardMessage = xpReward.leveledUp 
          ? `🎉 Journal saved! +${xpReward.earned} XP earned! Level up: ${xpReward.oldLevel} → ${xpReward.newLevel}!`
          : `✅ Journal saved! +${xpReward.earned} XP earned! Total XP: ${xpReward.totalXp}`;
        setMessage(rewardMessage);
      } else {
        setMessage('Journal entry saved successfully!');
      }
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('Failed to save journal entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = async (entryId) => {
    if (!editedContent.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/journals/${entryId}`, {
        content: editedContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJournalEntries(journalEntries.map(entry => 
        entry._id === entryId ? response.data : entry
      ));
      setEditingEntry(null);
      setEditedContent('');
      setMessage('Journal entry updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update journal entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/journals/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJournalEntries(journalEntries.filter(entry => entry._id !== entryId));
      setMessage('Journal entry deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete journal entry.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (entry) => {
    setEditingEntry(entry._id);
    setEditedContent(entry.content);
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setEditedContent('');
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Navigation />
    <div className="journaling-page">
      <div className="journal-header">
        <h1>My Journal</h1>
        <button 
          className="new-entry-btn"
          onClick={() => setShowNewEntryForm(!showNewEntryForm)}
          disabled={loading}
        >
          {showNewEntryForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {showNewEntryForm && (
        <div className="new-entry-form">
          <h3>Write a new journal entry</h3>
          <form onSubmit={handleCreateEntry}>
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="What's on your mind today?"
              rows="6"
              required
            />
            <div className="form-actions">
              <button type="submit" disabled={loading || !newEntry.trim()}>
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowNewEntryForm(false);
                  setNewEntry('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="journal-entries">
        {loading && journalEntries.length === 0 ? (
          <div className="loading">Loading journal entries...</div>
        ) : journalEntries.length === 0 ? (
          <div className="empty-state">
            <h3>No journal entries yet</h3>
            <p>Start writing your first journal entry to begin your journey!</p>
          </div>
        ) : (
          journalEntries.map((entry) => (
            <div key={entry._id} className="journal-entry">
              <div className="entry-header">
                <span className="entry-date">
                  {formatDate(entry.date || entry.createdAt)}
                </span>
                <div className="entry-actions">
                  {editingEntry !== entry._id && (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={() => startEditing(entry)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteEntry(entry._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingEntry === entry._id ? (
                <div className="edit-form">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows="6"
                  />
                  <div className="form-actions">
                    <button 
                      onClick={() => handleEditEntry(entry._id)}
                      disabled={loading || !editedContent.trim()}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="entry-content">
                  {entry.content}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default Journaling; 