import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PropTypes from 'prop-types';

import { FaSpinner } from 'react-icons/fa';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueFilter,
  IssueList,
  Label,
  PageActions,
} from './styles';

Repository.propTypes = {
  match: PropTypes.shape(
    {
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }.isRequired,
  ),
};

export default function Repository({ match }) {
  const [repository, setRepository] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([
    { state: 'all', label: 'Todas', active: true },
    { state: 'open', label: 'Abertas', active: false },
    { state: 'closed', label: 'Fechadas', active: false },
  ]);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const repoName = decodeURIComponent(match.params.repository);

    const fetchData = async () => {
      const [repository, issues] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            per_page: 5,
            state: filters.find(f => f.active).state,
          },
        }),
      ]);
      setRepository(repository.data);
      setIssues(issues.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const loadIssues = async () => {
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });

    setIssues(response.data);
  };

  useEffect(() => {
    setPage(1);
    /*/no need to load issues because it is changing the page so the load issues
    will be triggered by the use effech watching the page change*/
  }, [filterIndex]);

  const handlePage = async action => {
    setPage(action === 'back' ? page - 1 : page + 1);
  };

  useEffect(() => {
    loadIssues();
  }, [page]);

  if (loading) {
    return (
      <>
        <Loading>
          Carregando <FaSpinner size={26} color='#FFF' />
        </Loading>
      </>
    );
  }

  return (
    <Container>
      <Owner>
        <Link to='/'>Voltar aos repositórios</Link>
        <img src={repository.owner.avatar_url} alt={repository.owner.login} />
        <h1>{repository.name}</h1>
        <p>{repository.description}</p>
      </Owner>

      <IssueList>
        <IssueFilter active={filterIndex}>
          {filters.map((filter, index) => (
            <button
              type='button'
              key={filter.label}
              onClick={() => setFilterIndex(index)}
            >
              {filter.label}
            </button>
          ))}
        </IssueFilter>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map(label => {
                  return (
                    <Label key={String(label.id)} color={label.color}>
                      {label.name}
                    </Label>
                  );
                })}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssueList>
      <PageActions>
        <button
          type='button'
          disabled={page < 2}
          onClick={() => handlePage('back')}
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button type='button' onClick={() => handlePage('next')}>
          Próximo
        </button>
      </PageActions>
    </Container>
  );
}
