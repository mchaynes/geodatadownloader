import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusAlert } from '../StatusAlert';

describe('StatusAlert', () => {
    test('renders message and details toggle when details provided', async () => {
        render(
            <StatusAlert alertType="error" msg="Friendly message" details="Technical details here" />
        );

        // Friendly message visible
        expect(screen.getByText(/Friendly message/)).toBeInTheDocument();

        // Summary should be present
        const summary = screen.getByText(/Show details/);
        expect(summary).toBeInTheDocument();

        // details hidden initially; clicking summary reveals text
        await userEvent.click(summary);
        expect(screen.getByText(/Technical details here/)).toBeInTheDocument();
    });
});
