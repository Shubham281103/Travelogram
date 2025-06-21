import React from 'react'
import './PlaceList.css'
import Button from '../../shared/components/FormElements/Button'
import PlaceItem from './PlaceItem'
import Card from '../../shared/components/UIElements/Card'
const PlaceList = props => {
  if(props.items.length===0){
    return (
    <div className='place-lst center'>
        <Card>
            <h2>No Places Found</h2>
            <Button to="/places/new">Share Place</Button>
        </Card>
    </div>
    )
  }
  return <ul className='place-list'>
    {props.items.map(place=> <PlaceItem 
    key={place.id} 
    id={place.id} 
    image={place.image}
    title={place.title}
    description={place.description}
    address={place.address}
    creatorID={place.creator}
    coordinates={place.location}
    onDelete={props.onDeletePlace}
    />)}
  </ul>
}

export default PlaceList