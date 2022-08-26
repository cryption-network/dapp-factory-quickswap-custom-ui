import { Box, ListItem } from '@mui/material';
import React, { useState, useCallback, useRef, RefObject, useEffect } from 'react'
import { ReactComponent as SearchIcon } from '../../images/SearchIcon.svg';
import { ReactComponent as TokenSelectedIcon } from '../../images/TokenSelected.svg';
import Modal from '../Modal';
import useDebouncedChangeHandler from '../../hooks/useDebouncedChangeHandler';
import { isAddress } from '../../utils';
import './index.css';

interface CurrencySearchProps {
  tokens: any;
  selectedCurrency?: any;
  onSelect: (token: any) => void;
  isOpen: boolean;
  onDismiss: () => void;
}

const TokenList: React.FC<CurrencySearchProps> = ({
  selectedCurrency,
  onSelect,
  tokens,
  isOpen,
  onDismiss
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>();
  const [inputTokens, setTokens] = useState(tokens);
  const handleInput = useCallback((input: string) => {
    if (input.length === 0) {
      setTokens([...tokens]);
    } else {
      const checksummedInput = isAddress(input);
      setSearchQuery(checksummedInput || input);
      if (checksummedInput) {
        const filteredTokens = tokens.filter((token: any) => token.address.toLowerCase().includes(input.toLowerCase()))
        setTokens(filteredTokens)
      } else {
        const filteredTokens = tokens.filter((token: any) => token.name.toUpperCase().includes(input.toUpperCase()) || token.symbol.toUpperCase().includes(input.toUpperCase()))
        setTokens(filteredTokens)
      }
    }
  }, [tokens]);
  const [searchQueryInput, setSearchQueryInput] = useDebouncedChangeHandler(
    searchQuery,
    handleInput,
  );
  useEffect(() => {
    setTokens(tokens);
  }, [tokens])

  return (
    <Modal open={isOpen} title="Select Token" onClose={() => { if (onDismiss) onDismiss() }}>
      <Box className='searchInputWrapper'>
        <SearchIcon />
        <input
          type='text'
          placeholder='Search Token by name or paste address'
          value={searchQueryInput}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={(e) => setSearchQueryInput(e.target.value)}
        />
      </Box>
      <Box flex={1}>
        {inputTokens.map((eachToken: any) =>
          <ListItem
            button
            selected={selectedCurrency && selectedCurrency.address === eachToken.address}
            onClick={() => {
              if (onSelect) onSelect(eachToken);
            }}
          >
            <Box className='currencyRow'>
              {selectedCurrency && selectedCurrency.address === eachToken.address &&
                <TokenSelectedIcon />
              }
              <img src={eachToken.logoURI} alt={eachToken.symbol} width="28px" height="28px" style={{ marginRight: '10px' }} />
              <small className='currencySymbol'>{eachToken.symbol}</small>
            </Box>
          </ListItem>
        )}
      </Box>
    </Modal>
  )
}

export default TokenList;