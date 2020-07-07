import React, { useState, useEffect } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

import api from '../../services/api';

export default function Main() {
  const [newRepo, setNewRepo] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async e => {
    try {
      e.preventDefault();

      setLoading(true);

      if (repositories.find(newRepo)) {
        throw new Error('Repositório duplicado');
      }

      const { data } = await api.get(`/repos/${newRepo}`);

      const repo = {
        name: data.full_name,
      };
      setRepositories([...repositories, repo]);
      setNewRepo('');
      setLoading(false);
      setError(false);
    } catch {
      setLoading(false);
      setError(true);
    }
  };
  const handleInputChange = e => {
    setNewRepo(e.target.value);
  };

  useEffect(() => {
    const storageRepos = localStorage.getItem('repositories');
    if (storageRepos) {
      setRepositories(JSON.parse(storageRepos));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('repositories', JSON.stringify(repositories));
  }, [repositories]);

  return (
    <Container>
      <h1>
        <FaGithubAlt />
        Repositórios
      </h1>

      <Form onSubmit={handleSubmit} error={error ? 1 : 0}>
        <input
          type='text'
          placeholder='Adicionar repositório'
          value={newRepo}
          onChange={handleInputChange}
        />

        <SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color='#fff' size={14} />
          ) : (
            <FaPlus color='#fff' size={14} />
          )}
        </SubmitButton>
      </Form>

      <List>
        {repositories.map(repository => (
          <li key={repository.name}>
            <span>{repository.name}</span>
            <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
              Detalhes
            </Link>
          </li>
        ))}
      </List>
    </Container>
  );
}
