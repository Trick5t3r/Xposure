import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const MarkdownRenderer = ({ markdown }) => {
  const theme = useTheme();
  const buttonRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef]);

  const CodeBlock = ({ inline, className, children, ...props }) => {
    const language = className?.replace('language-', '') || '';

    if (inline) {
      return (
        <Typography component="code" {...props}>
          {children}
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#2d2d2d',
          borderRadius: '8px',
          overflow: 'auto',
          paddingRight: `calc(${buttonWidth}px + 10px)`,
        }}
      >
        <SyntaxHighlighter
          style={materialDark}
          language={language}
          PreTag="div"
          {...props}
        >
          {String(children).trim()}
        </SyntaxHighlighter>
        <CopyToClipboard text={children}>
          <Button
            ref={buttonRef}
            variant="contained"
            size="small"
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Copier
          </Button>
        </CopyToClipboard>
      </Box>
    );
  };

  return (
    <Box>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeBlock,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Box>
  );
};

MarkdownRenderer.propTypes = {
  markdown: PropTypes.string.isRequired,
};

export default MarkdownRenderer;