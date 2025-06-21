import React from 'react'
import "./UsersList.css"
import UserItem from "./UserItem"
import Card from '../../shared/components/UIElements/Card'
const UsersList = props => {
    if(props.item.length===0){
        return (
        <div className='center'>
            <Card>
           <h2>No items found </h2>
           </Card>
           </div>
        )
       }
       return (
       <ul className='users-list'>
           {props.item.map(user =>
           <UserItem 
            key={user.id}
            id={user.id}
            name={user.name} 
            placeCount={user.places.length} 
            />)}
       </ul>
       )
}

export default UsersList