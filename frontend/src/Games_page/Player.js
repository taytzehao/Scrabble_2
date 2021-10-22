
class Player{
    constructor(username,yours=false){
      this.username=username;
      this.score=0;
      this.tiles=[];
      this.delete_list=[]
      this.active=false
      this.delete_active=false;
      this.challenge_active=false;   
      this.yours=yours
    }
  
    draw(sachet){
        let chosen_tile_list=[]

        for (let i=this.tiles.length;i<7 ;i++){
            let index=sachet.tiles.length*Math.random()<<0
            chosen_tile_list.push(sachet.tiles[index])
            sachet.tiles.splice(index,1)
            if(this.yours){
                chosen_tile_list[chosen_tile_list.length-1].canDrag=true
                chosen_tile_list[chosen_tile_list.length-1].canDrop=true
                chosen_tile_list[chosen_tile_list.length-1].container_index=i
                
            }
            if(sachet.tiles.length==0) {break}      
        } 
      
        return chosen_tile_list 
    }

    draw_by_tiles(drawn_tiles){
        
            for(let i =0;i<drawn_tiles.length;i++){
                if(!this.yours){
                drawn_tiles[i].canDrag=false
                drawn_tiles[i].canDrop=false
                }else{
                drawn_tiles[i].canDrag=true
                drawn_tiles[i].canDrop=true
            }
        }
        this.tiles=this.tiles.concat(drawn_tiles)
        
    }
  
  }

  export {Player}