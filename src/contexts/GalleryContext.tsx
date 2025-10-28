'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { GalleryImage } from '@/types/gallery'

interface GalleryState {
    images: GalleryImage[]
    selectedImage: GalleryImage | null
    selectedIndex: number
    isModalOpen: boolean
    loading: boolean
    error: string | null
}

type GalleryAction =
    | { type: 'SET_IMAGES'; payload: GalleryImage[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SELECT_IMAGE'; payload: { image: GalleryImage; index: number } }
    | { type: 'OPEN_MODAL' }
    | { type: 'CLOSE_MODAL' }
    | { type: 'NEXT_IMAGE' }
    | { type: 'PREV_IMAGE' }

const initialState: GalleryState = {
    images: [],
    selectedImage: null,
    selectedIndex: 0,
    isModalOpen: false,
    loading: false,
    error: null
}

const galleryReducer = (state: GalleryState, action: GalleryAction): GalleryState => {
    switch (action.type) {
        case 'SET_IMAGES':
            return { ...state, images: action.payload }
        case 'SET_LOADING':
            return { ...state, loading: action.payload }
        case 'SET_ERROR':
            return { ...state, error: action.payload }
        case 'SELECT_IMAGE':
            return {
                ...state,
                selectedImage: action.payload.image,
                selectedIndex: action.payload.index,
                isModalOpen: true
            }
        case 'OPEN_MODAL':
            return { ...state, isModalOpen: true }
        case 'CLOSE_MODAL':
            return { ...state, isModalOpen: false }
        case 'NEXT_IMAGE':
            const nextIndex = (state.selectedIndex + 1) % state.images.length
            return {
                ...state,
                selectedIndex: nextIndex,
                selectedImage: state.images[nextIndex]
            }
        case 'PREV_IMAGE':
            const prevIndex = (state.selectedIndex - 1 + state.images.length) % state.images.length
            return {
                ...state,
                selectedIndex: prevIndex,
                selectedImage: state.images[prevIndex]
            }
        default:
            return state
    }
}

interface GalleryContextType {
    state: GalleryState
    dispatch: React.Dispatch<GalleryAction>
    selectImage: (image: GalleryImage, index: number) => void
    openModal: () => void
    closeModal: () => void
    nextImage: () => void
    prevImage: () => void
    fetchImages: () => Promise<void>
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined)

interface GalleryProviderProps {
    children: ReactNode
}

export const GalleryProvider = ({ children }: GalleryProviderProps) => {
    const [state, dispatch] = useReducer(galleryReducer, initialState)

    const selectImage = (image: GalleryImage, index: number) => {
        dispatch({ type: 'SELECT_IMAGE', payload: { image, index } })
    }

    const openModal = () => {
        dispatch({ type: 'OPEN_MODAL' })
    }

    const closeModal = () => {
        dispatch({ type: 'CLOSE_MODAL' })
    }

    const nextImage = () => {
        dispatch({ type: 'NEXT_IMAGE' })
    }

    const prevImage = () => {
        dispatch({ type: 'PREV_IMAGE' })
    }

    const fetchImages = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'SET_ERROR', payload: null })

            const response = await fetch('/api/gallery')
            if (!response.ok) {
                throw new Error('Failed to fetch images')
            }

            const data = await response.json()
            dispatch({ type: 'SET_IMAGES', payload: data.images })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }

    return (
        <GalleryContext.Provider
            value={{
                state,
                dispatch,
                selectImage,
                openModal,
                closeModal,
                nextImage,
                prevImage,
                fetchImages
            }}
        >
            {children}
        </GalleryContext.Provider>
    )
}

export const useGallery = () => {
    const context = useContext(GalleryContext)
    if (context === undefined) {
        throw new Error('useGallery must be used within a GalleryProvider')
    }
    return context
}
