import { Alert } from '@heroui/react'
import React from 'react'

export default function ErrorMsg({ error }) {
    return (
        <>
            {error && <Alert className='mt-1.5 bg-red-50 rounded-2xl' status="danger">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>{error.message}</Alert.Title>
                </Alert.Content>
            </Alert>}
        </>
    )
}
