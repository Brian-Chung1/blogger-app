import React from 'react';
import { makeStyles, Container, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EmailIcon from '@material-ui/icons/Email';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';

const useStyles = makeStyles((theme) => ({
  centered: {
    display: 'flex',
    justifyContent: 'center',
  },
  email: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      alignItems: 'center',
    },
  },
}));

const Footer = () => {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Container maxWidth="sm" className={classes.centered}>
        <a
          href={'https://github.com/Brian-Chung1/blogger-app'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconButton>
            <GitHubIcon />
          </IconButton>
        </a>
        <a
          href={'https://www.linkedin.com/in/brian-chung-a2a72b196/'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconButton>
            <LinkedInIcon />
          </IconButton>
        </a>
        <a
          href={'mailto:brian.chung.cs@gmail.com'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconButton>
            <EmailIcon />
          </IconButton>
        </a>
        <Typography variant="button" className={classes.email}>
          brian.chung.cs@gmail.com
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;
