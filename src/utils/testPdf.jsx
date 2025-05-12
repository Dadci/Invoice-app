import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    text: {
        fontSize: 12,
    }
});

// Create test document component using createElement instead of JSX
const TestDocument = () => {
    return React.createElement(
        Document,
        {},
        React.createElement(
            Page,
            { size: 'A4', style: styles.page },
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(
                    Text,
                    { style: styles.text },
                    'This is a test PDF document.'
                )
            )
        )
    );
};

// Function to test PDF generation
export const testPdfGeneration = async () => {
    try {
        // Create the test document
        const testDoc = TestDocument();

        // Try to generate a PDF
        const blob = await pdf(testDoc).toBlob();

        // If we get here, PDF generation works
        console.log('PDF generation successful!');

        // Create a download link for the test PDF
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('PDF test generation failed:', error);
        return false;
    }
}; 