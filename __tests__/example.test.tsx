import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// A simple example component to test
function Greeting({ name = 'world' }: { name?: string }) {
  const [buttonText, setButtonText] = React.useState('Click me!');
  
  const handleClick = () => {
    setButtonText('Thanks for clicking!');
  };
  
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <button onClick={handleClick}>{buttonText}</button>
    </div>
  );
}

describe('Greeting component', () => {
  it('renders with default name', () => {
    render(<Greeting />);
    
    // Check if the greeting text is in the document
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    
    // Check if the button is in the document
    expect(screen.getByText('Click me!')).toBeInTheDocument();
  });
  
  it('renders with custom name', () => {
    render(<Greeting name="Musik" />);
    
    // Check if the greeting has the custom name
    expect(screen.getByText('Hello, Musik!')).toBeInTheDocument();
  });
  
  it('changes button text when clicked', async () => {
    // Setup user event for simulating interactions
    const user = userEvent.setup();
    
    render(<Greeting />);
    
    // Find the button
    const button = screen.getByText('Click me!');
    
    // Click the button
    await user.click(button);
    
    // Check if the button text changed
    expect(screen.getByText('Thanks for clicking!')).toBeInTheDocument();
  });
});

