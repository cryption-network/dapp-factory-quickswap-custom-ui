import React from 'react'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import FormControl from '@mui/material/FormControl';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#1C1E29',
  },
  '& .MuiInputBase-input': {
    borderRadius: 10,
    position: 'relative',
    width: '100%',
    color: '#636780',
    fontSize: 16,
    padding: '10px 12px',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    // Use the system font instead of the default Roboto font.
    fontFamily: 'Inter',
    '&:focus': {
      borderColor: '#1C1E29',
    },
  },
}));
export default function TokenInput(
  {
    onChange,
    onSelectMax,
    value }: any) {
  return (
    <div>
      <FormControl variant="standard" fullWidth>
        <BootstrapInput
          placeholder='0'
          onChange={onChange}
          value={value}
          id="bootstrap-input"
          fullWidth
          sx={{
            background: '#1C1E29',
            borderRadius: '10px'
          }}
          endAdornment={
            <Button sx={{ color: '#448aff' }} onClick={onSelectMax}>MAX</Button>
          }
        />
      </FormControl>
    </div>
  )
}
